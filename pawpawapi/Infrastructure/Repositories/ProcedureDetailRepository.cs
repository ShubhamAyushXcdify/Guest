using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Linq;

namespace Infrastructure.Repositories
{
    public class ProcedureDetailRepository : IProcedureDetailRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ProcedureDetailRepository> _logger;

        public ProcedureDetailRepository(DapperDbContext dbContext, ILogger<ProcedureDetailRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ProcedureDetail> CreateAsync(ProcedureDetail procedureDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    procedureDetail.Id = Guid.NewGuid();
                    procedureDetail.CreatedAt = DateTimeOffset.UtcNow;
                    procedureDetail.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        procedureDetail.Id,
                        procedureDetail.VisitId,
                        procedureDetail.Notes,
                        procedureDetail.IsCompleted,
                        procedureDetail.CreatedAt,
                        procedureDetail.UpdatedAt
                    };

                    var query = @"
INSERT INTO procedure_detail 
(id, visit_id, notes, is_completed, created_at, updated_at) 
VALUES 
(@Id, @VisitId, @Notes, @IsCompleted, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    visit_id AS VisitId,
    notes AS Notes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var createdProcedureDetail = await connection.QuerySingleAsync<ProcedureDetail>(query, parameters, transaction);
                    createdProcedureDetail.Procedures = new List<Procedure>();
                    transaction.Commit();
                    return createdProcedureDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create procedure detail", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create procedure detail", ex);
            }
        }

        public async Task<ProcedureDetail> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pd.id AS Id,
    pd.visit_id AS VisitId,
    pd.notes AS Notes,
    pd.is_completed AS IsCompleted,
    pd.created_at AS CreatedAt,
    pd.updated_at AS UpdatedAt
FROM procedure_detail pd
WHERE pd.id = @Id;";

                var procedureDetail = await connection.QuerySingleOrDefaultAsync<ProcedureDetail>(query, new { Id = id });
                if (procedureDetail != null)
                {
                    procedureDetail.Procedures = await GetProceduresForProcedureDetailAsync(connection, id);
                }
                return procedureDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for procedure detail {ProcedureDetailId}", id);
                throw new InvalidOperationException($"Failed to get procedure detail with id {id}", ex);
            }
        }

        public async Task<ProcedureDetail> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pd.id AS Id,
    pd.visit_id AS VisitId,
    pd.notes AS Notes,
    pd.is_completed AS IsCompleted,
    pd.created_at AS CreatedAt,
    pd.updated_at AS UpdatedAt
FROM procedure_detail pd
WHERE pd.visit_id = @VisitId
ORDER BY pd.created_at DESC;";

                var procedureDetails = await connection.QueryAsync<ProcedureDetail>(query, new { VisitId = visitId });
                var procedureDetail = procedureDetails.FirstOrDefault();
                
                if (procedureDetail != null)
                {
                    procedureDetail.Procedures = await GetProceduresForProcedureDetailAsync(connection, procedureDetail.Id);
                }
                return procedureDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to get procedure detail for visit {visitId}", ex);
            }
        }

        private async Task<ICollection<Procedure>> GetProceduresForProcedureDetailAsync(IDbConnection connection, Guid procedureDetailId)
        {
            var query = @"
SELECT 
    p.id AS Id,
    p.name AS Name,
    p.notes AS Notes,
    p.created_at AS CreatedAt,
    p.updated_at AS UpdatedAt
FROM procedures p
INNER JOIN procedure_detail_mapping pdm ON pdm.procedure_id = p.id
WHERE pdm.procedure_detail_id = @ProcedureDetailId;";

            var procedures = await connection.QueryAsync<Procedure>(query, new { ProcedureDetailId = procedureDetailId });
            return procedures.AsList();
        }

        public async Task<ProcedureDetail> UpdateAsync(ProcedureDetail procedureDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    procedureDetail.UpdatedAt = DateTimeOffset.UtcNow;

                    var setClauses = new List<string>();
                    var parameters = new DynamicParameters();
                    parameters.Add("Id", procedureDetail.Id);

                    if (procedureDetail.Notes != null)
                    {
                        setClauses.Add("notes = @Notes");
                        parameters.Add("Notes", procedureDetail.Notes);
                    }

                    setClauses.Add("is_completed = @IsCompleted");
                    parameters.Add("IsCompleted", procedureDetail.IsCompleted);

                    setClauses.Add("updated_at = @UpdatedAt");
                    parameters.Add("UpdatedAt", procedureDetail.UpdatedAt);

                    var setClause = string.Join(", ", setClauses);
                    var query = @"
UPDATE procedure_detail
SET " + setClause + @"
WHERE id = @Id
RETURNING 
    id AS Id,
    visit_id AS VisitId,
    notes AS Notes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var updatedProcedureDetail = await connection.QuerySingleAsync<ProcedureDetail>(query, parameters, transaction);
                    updatedProcedureDetail.Procedures = await GetProceduresForProcedureDetailAsync(connection, updatedProcedureDetail.Id);
                    transaction.Commit();
                    return updatedProcedureDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for procedure detail {ProcedureDetailId}", procedureDetail.Id);
                    throw new InvalidOperationException($"Failed to update procedure detail with id {procedureDetail.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for procedure detail {ProcedureDetailId}", procedureDetail.Id);
                throw new InvalidOperationException($"Failed to update procedure detail with id {procedureDetail.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM procedure_detail WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for procedure detail {ProcedureDetailId}", id);
                throw new InvalidOperationException($"Failed to delete procedure detail with id {id}", ex);
            }
        }

        public async Task<bool> AddProcedureAsync(Guid procedureDetailId, Guid procedureId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
INSERT INTO procedure_detail_mapping 
(id, procedure_detail_id, procedure_id, created_at, updated_at) 
VALUES 
(@Id, @ProcedureDetailId, @ProcedureId, @CreatedAt, @UpdatedAt);";

                var parameters = new
                {
                    Id = Guid.NewGuid(),
                    ProcedureDetailId = procedureDetailId,
                    ProcedureId = procedureId,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                var rowsAffected = await connection.ExecuteAsync(query, parameters);
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddProcedureAsync for procedure detail {ProcedureDetailId}", procedureDetailId);
                throw new InvalidOperationException($"Failed to add procedure for procedure detail {procedureDetailId}", ex);
            }
        }

        public async Task<bool> RemoveProcedureAsync(Guid procedureDetailId, Guid procedureId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM procedure_detail_mapping WHERE procedure_detail_id = @ProcedureDetailId AND procedure_id = @ProcedureId;";
                var rowsAffected = await connection.ExecuteAsync(query, new { ProcedureDetailId = procedureDetailId, ProcedureId = procedureId });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RemoveProcedureAsync for procedure detail {ProcedureDetailId}", procedureDetailId);
                throw new InvalidOperationException($"Failed to remove procedure for procedure detail {procedureDetailId}", ex);
            }
        }
    }
} 