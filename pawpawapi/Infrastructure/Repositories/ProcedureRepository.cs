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
    public class ProcedureRepository : IProcedureRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ProcedureRepository> _logger;

        public ProcedureRepository(DapperDbContext dbContext, ILogger<ProcedureRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Procedure> CreateAsync(Procedure procedure)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    procedure.Id = Guid.NewGuid();
                    procedure.CreatedAt = DateTimeOffset.UtcNow;
                    procedure.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        procedure.Id,
                        procedure.Name,
                        procedure.Notes,
                        procedure.Type,
                        procedure.ProcCode,
                        procedure.CreatedAt,
                        procedure.UpdatedAt
                    };

                    var query = @"
                                INSERT INTO procedures 
                                (id, name, notes, type, proc_code, created_at, updated_at) 
                                VALUES 
                                (@Id, @Name, @Notes, @Type, @ProcCode, @CreatedAt, @UpdatedAt) 
                                RETURNING 
                                    id AS Id,
                                    name AS Name,
                                    notes AS Notes,
                                    type AS Type,
                                    proc_code AS ProcCode,
                                    created_at AS CreatedAt,
                                    updated_at AS UpdatedAt;";

                    var createdProcedure = await connection.QuerySingleAsync<Procedure>(query, parameters, transaction);
                    transaction.Commit();
                    return createdProcedure;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create procedure", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create procedure", ex);
            }
        }

        public async Task<IEnumerable<Procedure>> GetAllAsync(string? type = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    name AS Name,
    notes AS Notes,
    type AS Type,
    proc_code AS ProcCode,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM procedures";
                if (!string.IsNullOrEmpty(type))
                {
                    query += " WHERE type = @Type";
                }
                var procedures = await connection.QueryAsync<Procedure>(query, new { Type = type });
                return procedures;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get procedures", ex);
            }
        }

        public async Task<Procedure> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    name AS Name,
    notes AS Notes,
    type AS Type,
    proc_code AS ProcCode,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM procedures 
WHERE id = @Id;";

                var procedure = await connection.QuerySingleOrDefaultAsync<Procedure>(query, new { Id = id });
                return procedure;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for procedure {ProcedureId}", id);
                throw new InvalidOperationException($"Failed to get procedure with id {id}", ex);
            }
        }

        public async Task<Procedure> UpdateAsync(Procedure procedure)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    procedure.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        procedure.Id,
                        procedure.Name,
                        procedure.Notes,
                        procedure.Type,
                        procedure.ProcCode,
                        procedure.UpdatedAt
                    };

                    var query = @"
UPDATE procedures
SET 
    name = @Name,
    notes = @Notes,
    type = @Type,
    proc_code = @ProcCode,
    updated_at = @UpdatedAt
WHERE id = @Id
RETURNING 
    id AS Id,
    name AS Name,
    notes AS Notes,
    type AS Type,
    proc_code AS ProcCode,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var updatedProcedure = await connection.QuerySingleAsync<Procedure>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedProcedure;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for procedure {ProcedureId}", procedure.Id);
                    throw new InvalidOperationException($"Failed to update procedure with id {procedure.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for procedure {ProcedureId}", procedure.Id);
                throw new InvalidOperationException($"Failed to update procedure with id {procedure.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM procedures WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for procedure {ProcedureId}", id);
                throw new InvalidOperationException($"Failed to delete procedure with id {id}", ex);
            }
        }
    }
} 