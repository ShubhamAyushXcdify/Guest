using System;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using System.Data;
using NpgsqlTypes;

namespace Infrastructure.Repositories
{
    public class ProcedureDocumentDetailsRepository : IProcedureDocumentDetailsRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ProcedureDocumentDetailsRepository> _logger;

        public ProcedureDocumentDetailsRepository(DapperDbContext dbContext, ILogger<ProcedureDocumentDetailsRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ProcedureDetailMapping> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pdm.id AS Id,
    pdm.procedure_detail_id AS ProcedureDetailId,
    pdm.procedure_id AS ProcedureId,
    pdm.document_details::text AS DocumentDetails,
    pdm.created_at AS CreatedAt,
    pdm.updated_at AS UpdatedAt
FROM procedure_detail_mapping pdm
WHERE pdm.id = @Id;";

                var mapping = await connection.QuerySingleOrDefaultAsync<ProcedureDetailMapping>(query, new { Id = id });
                if (mapping != null)
                {
                    var docStr = mapping.DocumentDetails as string;
                    if (!string.IsNullOrWhiteSpace(docStr))
                    {
                        // REMOVE: mapping.DocumentDetails = System.Text.Json.JsonDocument.Parse(docStr);
                    }
                }
                return mapping;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for mapping {MappingId}", id);
                throw new InvalidOperationException($"Failed to get procedure document details with id {id}", ex);
            }
        }

        public async Task<ProcedureDetailMapping> GetByVisitAndProcedureAsync(Guid visitId, Guid procedureId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pdm.id AS Id,
    pdm.procedure_detail_id AS ProcedureDetailId,
    pdm.procedure_id AS ProcedureId,
    pdm.document_details::text AS DocumentDetails,
    pdm.created_at AS CreatedAt,
    pdm.updated_at AS UpdatedAt
FROM procedure_detail_mapping pdm
LEFT JOIN procedure_detail pd ON pd.id = pdm.procedure_detail_id
WHERE pd.visit_id = @VisitId AND pdm.procedure_id = @ProcedureId;";

                var mapping = await connection.QuerySingleOrDefaultAsync<ProcedureDetailMapping>(query, new { VisitId = visitId, ProcedureId = procedureId });
                if (mapping != null)
                {
                    var docStr = mapping.DocumentDetails as string;
                    if (!string.IsNullOrWhiteSpace(docStr))
                    {
                        // REMOVE: mapping.DocumentDetails = System.Text.Json.JsonDocument.Parse(docStr);
                    }
                }
                return mapping;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitAndProcedureAsync for visit {VisitId} and procedure {ProcedureId}", visitId, procedureId);
                throw new InvalidOperationException($"Failed to get procedure document details for visit {visitId} and procedure {procedureId}", ex);
            }
        }

        public async Task<ProcedureDetailMapping> CreateAsync(ProcedureDetailMapping mapping)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    mapping.Id = Guid.NewGuid();
                    mapping.CreatedAt = DateTimeOffset.UtcNow;
                    mapping.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new Dapper.DynamicParameters();
                    parameters.Add("Id", mapping.Id);
                    parameters.Add("ProcedureDetailId", mapping.ProcedureDetailId);
                    parameters.Add("ProcedureId", mapping.ProcedureId);
                    parameters.Add("DocumentDetails", mapping.DocumentDetails, dbType: System.Data.DbType.String);
                    parameters.Add("CreatedAt", mapping.CreatedAt);
                    parameters.Add("UpdatedAt", mapping.UpdatedAt);

                    var query = @"
INSERT INTO procedure_detail_mapping 
(id, procedure_detail_id, procedure_id, document_details, created_at, updated_at) 
VALUES 
(@Id, @ProcedureDetailId, @ProcedureId, @DocumentDetails::jsonb, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    procedure_detail_id AS ProcedureDetailId,
    procedure_id AS ProcedureId,
    document_details::text AS DocumentDetails,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var createdMapping = await connection.QuerySingleAsync<ProcedureDetailMapping>(query, parameters, transaction);
                    transaction.Commit();
                    return createdMapping;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create procedure document details", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create procedure document details", ex);
            }
        }

        public async Task<ProcedureDetailMapping> UpdateAsync(ProcedureDetailMapping mapping)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    mapping.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new Dapper.DynamicParameters();
                    parameters.Add("Id", mapping.Id);
                    parameters.Add("DocumentDetails", mapping.DocumentDetails, dbType: System.Data.DbType.String);
                    parameters.Add("UpdatedAt", mapping.UpdatedAt);

                    var query = @"
UPDATE procedure_detail_mapping 
SET document_details = @DocumentDetails::jsonb, updated_at = @UpdatedAt
WHERE id = @Id
RETURNING 
    id AS Id,
    procedure_detail_id AS ProcedureDetailId,
    procedure_id AS ProcedureId,
    document_details::text AS DocumentDetails,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var updatedMapping = await connection.QuerySingleAsync<ProcedureDetailMapping>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedMapping;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for mapping {MappingId}", mapping.Id);
                    throw new InvalidOperationException($"Failed to update procedure document details with id {mapping.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for mapping {MappingId}", mapping.Id);
                throw new InvalidOperationException($"Failed to update procedure document details with id {mapping.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM procedure_detail_mapping WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for mapping {MappingId}", id);
                throw new InvalidOperationException($"Failed to delete procedure document details with id {id}", ex);
            }
        }
    }
} 