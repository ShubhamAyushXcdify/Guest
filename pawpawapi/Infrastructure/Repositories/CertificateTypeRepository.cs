using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class CertificateTypeRepository : ICertificateTypeRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<CertificateTypeRepository> _logger;

        public CertificateTypeRepository(DapperDbContext dbContext, ILogger<CertificateTypeRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<CertificateType> CreateAsync(CertificateType certificateType)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    certificateType.Id = Guid.NewGuid();
                    certificateType.CreatedAt = DateTimeOffset.UtcNow;
                    certificateType.UpdatedAt = DateTimeOffset.UtcNow;

                    var query = @"
                        INSERT INTO certificate_type (id, name, description, is_active, created_at, updated_at)
                        VALUES (@Id, @Name, @Description, @IsActive, @CreatedAt, @UpdatedAt)
                        RETURNING 
                            id AS Id,
                            name AS Name,
                            description AS Description,
                            is_active AS IsActive,
                            created_at AS CreatedAt,
                            updated_at AS UpdatedAt;";

                    var createdCertificateType = await connection.QuerySingleAsync<CertificateType>(query, certificateType, transaction);
                    transaction.Commit();
                    return createdCertificateType;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create certificate type", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create certificate type", ex);
            }
        }

        public async Task<CertificateType> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
                    SELECT 
                        id AS Id,
                        name AS Name,
                        description AS Description,
                        is_active AS IsActive,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM certificate_type 
                    WHERE id = @Id;";

                var certificateType = await connection.QuerySingleOrDefaultAsync<CertificateType>(query, new { Id = id });
                return certificateType;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for certificate type {CertificateTypeId}", id);
                throw new InvalidOperationException($"Failed to get certificate type with id {id}", ex);
            }
        }

        public async Task<IEnumerable<CertificateType>> GetAllAsync()
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
                    SELECT 
                        id AS Id,
                        name AS Name,
                        description AS Description,
                        is_active AS IsActive,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM certificate_type
                    ORDER BY created_at DESC;";

                var certificateTypes = await connection.QueryAsync<CertificateType>(query);
                return certificateTypes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get all certificate types", ex);
            }
        }

        public async Task<CertificateType> UpdateAsync(CertificateType certificateType)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    var setClauses = new List<string>();
                    var parameters = new DynamicParameters();
                    parameters.Add("Id", certificateType.Id);

                    if (!string.IsNullOrWhiteSpace(certificateType.Name))
                    {
                        setClauses.Add("name = @Name");
                        parameters.Add("Name", certificateType.Name);
                    }

                    if (certificateType.Description != null)
                    {
                        setClauses.Add("description = @Description");
                        parameters.Add("Description", certificateType.Description);
                    }

                    setClauses.Add("is_active = @IsActive");
                    parameters.Add("IsActive", certificateType.IsActive);

                    setClauses.Add("updated_at = CURRENT_TIMESTAMP");

                    if (setClauses.Count == 1) // Only updated_at, nothing else changed
                        throw new InvalidOperationException("No fields to update.");

                    var setClause = string.Join(", ", setClauses);
                    var query = @"
                        UPDATE certificate_type
                        SET " + setClause + @"
                        WHERE id = @Id
                        RETURNING 
                            id AS Id,
                            name AS Name,
                            description AS Description,
                            is_active AS IsActive,
                            created_at AS CreatedAt,
                            updated_at AS UpdatedAt;";

                    var updatedCertificateType = await connection.QuerySingleAsync<CertificateType>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedCertificateType;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for certificate type {CertificateTypeId}", certificateType.Id);
                    throw new InvalidOperationException($"Failed to update certificate type with id {certificateType.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for certificate type {CertificateTypeId}", certificateType.Id);
                throw new InvalidOperationException($"Failed to update certificate type with id {certificateType.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM certificate_type WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for certificate type {CertificateTypeId}", id);
                throw new InvalidOperationException($"Failed to delete certificate type with id {id}", ex);
            }
        }
    }
}

