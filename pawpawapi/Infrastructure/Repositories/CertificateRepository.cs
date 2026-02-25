using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class CertificateRepository : ICertificateRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<CertificateRepository> _logger;

        public CertificateRepository(DapperDbContext dbContext, ILogger<CertificateRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<IEnumerable<Certificate>> GetAllAsync()
        {
            using var connection = _dbContext.GetConnection();
            try
            {
                var query = @"
                    SELECT c.id AS Id,
                           c.visit_id AS VisitId,
                           c.certificate_type_id AS CertificateTypeId,
                           ct.name AS CertificateTypeName,
                           c.certificate_json AS CertificateJson,
                           c.created_at AS CreatedAt,
                           c.updated_at AS UpdatedAt
                    FROM certificate c
                    LEFT JOIN certificate_type ct ON c.certificate_type_id = ct.id
                    ORDER BY c.created_at DESC";

                return await connection.QueryAsync<Certificate>(query);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to retrieve certificates.", ex);
            }
        }

        public async Task<Certificate> GetByIdAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            try
            {
                var query = @"
                    SELECT c.id AS Id,
                           c.visit_id AS VisitId,
                           c.certificate_type_id AS CertificateTypeId,
                           ct.name AS CertificateTypeName,
                           c.certificate_json AS CertificateJson,
                           c.created_at AS CreatedAt,
                           c.updated_at AS UpdatedAt
                    FROM certificate c
                    LEFT JOIN certificate_type ct ON c.certificate_type_id = ct.id
                    WHERE c.id = @Id";

                return await connection.QuerySingleOrDefaultAsync<Certificate>(query, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for certificate {CertificateId}", id);
                throw new InvalidOperationException("Failed to retrieve certificate.", ex);
            }
        }

        public async Task<IEnumerable<Certificate>> GetByVisitIdAsync(Guid visitId)
        {
            using var connection = _dbContext.GetConnection();
            try
            {
                var query = @"
                    SELECT c.id AS Id,
                           c.visit_id AS VisitId,
                           c.certificate_type_id AS CertificateTypeId,
                           ct.name AS CertificateTypeName,
                           c.certificate_json AS CertificateJson,
                           c.created_at AS CreatedAt,
                           c.updated_at AS UpdatedAt
                    FROM certificate c
                    LEFT JOIN certificate_type ct ON c.certificate_type_id = ct.id
                    WHERE c.visit_id = @VisitId
                    ORDER BY c.created_at DESC";

                return await connection.QueryAsync<Certificate>(query, new { VisitId = visitId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw new InvalidOperationException("Failed to retrieve certificates for visit.", ex);
            }
        }

        public async Task<Certificate> AddAsync(Certificate certificate)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                certificate.Id = Guid.NewGuid();
                certificate.CreatedAt = DateTimeOffset.UtcNow;
                certificate.UpdatedAt = DateTimeOffset.UtcNow;

                var insertQuery = @"
                    INSERT INTO certificate (id, visit_id, certificate_type_id, certificate_json, created_at, updated_at)
                    VALUES (@Id, @VisitId, @CertificateTypeId, @CertificateJson, @CreatedAt, @UpdatedAt)
                    RETURNING id";

                var createdId = await connection.QuerySingleAsync<Guid>(insertQuery, certificate, transaction);

                // Query the created certificate with certificate type name
                var selectQuery = @"
                    SELECT c.id AS Id,
                           c.visit_id AS VisitId,
                           c.certificate_type_id AS CertificateTypeId,
                           ct.name AS CertificateTypeName,
                           c.certificate_json AS CertificateJson,
                           c.created_at AS CreatedAt,
                           c.updated_at AS UpdatedAt
                    FROM certificate c
                    LEFT JOIN certificate_type ct ON c.certificate_type_id = ct.id
                    WHERE c.id = @Id";

                var createdCertificate = await connection.QuerySingleAsync<Certificate>(selectQuery, new { Id = createdId }, transaction);
                transaction.Commit();
                return createdCertificate;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in AddAsync");
                throw new InvalidOperationException("Failed to create certificate.", ex);
            }
        }

        public async Task<IEnumerable<Certificate>> AddBatchAsync(IEnumerable<Certificate> certificates)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                var createdIds = new List<Guid>();
                var now = DateTimeOffset.UtcNow;

                foreach (var certificate in certificates)
                {
                    certificate.Id = Guid.NewGuid();
                    certificate.CreatedAt = now;
                    certificate.UpdatedAt = now;

                    var insertQuery = @"
                        INSERT INTO certificate (id, visit_id, certificate_type_id, certificate_json, created_at, updated_at)
                        VALUES (@Id, @VisitId, @CertificateTypeId, @CertificateJson, @CreatedAt, @UpdatedAt)
                        RETURNING id";

                    var createdId = await connection.QuerySingleAsync<Guid>(insertQuery, certificate, transaction);
                    createdIds.Add(createdId);
                }

                // Query all created certificates with certificate type name
                var selectQuery = @"
                    SELECT c.id AS Id,
                           c.visit_id AS VisitId,
                           c.certificate_type_id AS CertificateTypeId,
                           ct.name AS CertificateTypeName,
                           c.certificate_json AS CertificateJson,
                           c.created_at AS CreatedAt,
                           c.updated_at AS UpdatedAt
                    FROM certificate c
                    LEFT JOIN certificate_type ct ON c.certificate_type_id = ct.id
                    WHERE c.id = ANY(@Ids)
                    ORDER BY c.created_at DESC";

                var createdCertificates = await connection.QueryAsync<Certificate>(selectQuery, new { Ids = createdIds.ToArray() }, transaction);

                transaction.Commit();
                return createdCertificates;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in AddBatchAsync");
                throw new InvalidOperationException("Failed to create certificates.", ex);
            }
        }

        public async Task<Certificate> UpdateAsync(Certificate certificate)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                var updateQuery = @"
                    UPDATE certificate
                    SET visit_id = @VisitId, certificate_type_id = @CertificateTypeId, certificate_json = @CertificateJson, updated_at = @UpdatedAt
                    WHERE id = @Id
                    RETURNING id";

                var updatedId = await connection.QuerySingleOrDefaultAsync<Guid?>(updateQuery, certificate, transaction);
                
                if (updatedId == null)
                {
                    transaction.Rollback();
                    return null;
                }

                // Query the updated certificate with certificate type name
                var selectQuery = @"
                    SELECT c.id AS Id,
                           c.visit_id AS VisitId,
                           c.certificate_type_id AS CertificateTypeId,
                           ct.name AS CertificateTypeName,
                           c.certificate_json AS CertificateJson,
                           c.created_at AS CreatedAt,
                           c.updated_at AS UpdatedAt
                    FROM certificate c
                    LEFT JOIN certificate_type ct ON c.certificate_type_id = ct.id
                    WHERE c.id = @Id";

                var updatedCertificate = await connection.QuerySingleAsync<Certificate>(selectQuery, new { Id = updatedId.Value }, transaction);
                transaction.Commit();
                return updatedCertificate;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for certificate {CertificateId}", certificate.Id);
                throw new InvalidOperationException("Failed to update certificate.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                var query = "DELETE FROM certificate WHERE id = @Id";
                var affectedRows = await connection.ExecuteAsync(query, new { Id = id }, transaction);
                transaction.Commit();
                return affectedRows > 0;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in DeleteAsync for certificate {CertificateId}", id);
                throw new InvalidOperationException("Failed to delete certificate.", ex);
            }
        }

        public async Task<bool> DeleteByVisitIdAsync(Guid visitId)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                var query = "DELETE FROM certificate WHERE visit_id = @VisitId";
                var affectedRows = await connection.ExecuteAsync(query, new { VisitId = visitId }, transaction);
                transaction.Commit();
                return affectedRows > 0;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in DeleteByVisitIdAsync for visit {VisitId}", visitId);
                throw new InvalidOperationException("Failed to delete certificates for visit.", ex);
            }
        }
    }
}