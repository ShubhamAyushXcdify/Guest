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
    public class PlanRepository : IPlanRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<PlanRepository> _logger;

        public PlanRepository(DapperDbContext dbContext, ILogger<PlanRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Plan> CreateAsync(Plan plan)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    plan.Id = Guid.NewGuid();
                    plan.CreatedAt = DateTimeOffset.UtcNow;
                    plan.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        plan.Id,
                        plan.Name,
                        plan.Notes,
                        plan.CreatedAt,
                        plan.UpdatedAt
                    };

                    var query = @"
                                INSERT INTO plans 
                                (id, name, notes, created_at, updated_at) 
                                VALUES 
                                (@Id, @Name, @Notes, @CreatedAt, @UpdatedAt) 
                                RETURNING 
                                    id AS Id,
                                    name AS Name,
                                    notes AS Notes,
                                    created_at AS CreatedAt,
                                    updated_at AS UpdatedAt;";

                    var createdPlan = await connection.QuerySingleAsync<Plan>(query, parameters, transaction);
                    transaction.Commit();
                    return createdPlan;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create plan", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create plan", ex);
            }
        }

        public async Task<IEnumerable<Plan>> GetAllAsync()
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    name AS Name,
    notes AS Notes,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM plans;";

                var plans = await connection.QueryAsync<Plan>(query);
                return plans;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get plans", ex);
            }
        }

        public async Task<Plan> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    name AS Name,
    notes AS Notes,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM plans 
WHERE id = @Id;";

                var plan = await connection.QuerySingleOrDefaultAsync<Plan>(query, new { Id = id });
                return plan;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for plan {PlanId}", id);
                throw new InvalidOperationException($"Failed to get plan with id {id}", ex);
            }
        }

        public async Task<Plan> UpdateAsync(Plan plan)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    plan.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        plan.Id,
                        plan.Name,
                        plan.Notes,
                        plan.UpdatedAt
                    };

                    var query = @"
UPDATE plans
SET 
    name = @Name,
    notes = @Notes,
    updated_at = @UpdatedAt
WHERE id = @Id
RETURNING 
    id AS Id,
    name AS Name,
    notes AS Notes,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var updatedPlan = await connection.QuerySingleAsync<Plan>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedPlan;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for plan {PlanId}", plan.Id);
                    throw new InvalidOperationException($"Failed to update plan with id {plan.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for plan {PlanId}", plan.Id);
                throw new InvalidOperationException($"Failed to update plan with id {plan.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM plans WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for plan {PlanId}", id);
                throw new InvalidOperationException($"Failed to delete plan with id {id}", ex);
            }
        }
    }
} 