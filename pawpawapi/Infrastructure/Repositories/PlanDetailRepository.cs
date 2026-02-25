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
    public class PlanDetailRepository : IPlanDetailRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<PlanDetailRepository> _logger;

        public PlanDetailRepository(DapperDbContext dbContext, ILogger<PlanDetailRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PlanDetail> CreateAsync(PlanDetail planDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                   

                    var query = @"
INSERT INTO plan_detail 
(id, visit_id, notes, is_completed, follow_up_date, created_at, updated_at) 
VALUES 
(@Id, @VisitId, @Notes, @IsCompleted, @FollowUpDate, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    visit_id AS VisitId,
    notes AS Notes,
    is_completed AS IsCompleted,
    follow_up_date AS FollowUpDate,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var createdPlanDetail = await connection.QuerySingleAsync<PlanDetail>(query, planDetail, transaction);
                    createdPlanDetail.Plans = new List<Plan>();
                    transaction.Commit();
                    return createdPlanDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create plan detail", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create plan detail", ex);
            }
        }

        public async Task<PlanDetail> GetByIdAsync(Guid id)
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
    pd.follow_up_date AS FollowUpDate,
    pd.created_at AS CreatedAt,
    pd.updated_at AS UpdatedAt
FROM plan_detail pd
WHERE pd.id = @Id;";

                var planDetail = await connection.QuerySingleOrDefaultAsync<PlanDetail>(query, new { Id = id });
                if (planDetail != null)
                {
                    planDetail.Plans = await GetPlansForPlanDetailAsync(connection, id);
                }
                return planDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for plan detail {PlanDetailId}", id);
                throw new InvalidOperationException($"Failed to get plan detail with id {id}", ex);
            }
        }

        public async Task<PlanDetail> GetByVisitIdAsync(Guid visitId)
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
    pd.follow_up_date AS FollowUpDate,
    pd.created_at AS CreatedAt,
    pd.updated_at AS UpdatedAt
FROM plan_detail pd
WHERE pd.visit_id = @VisitId
ORDER BY pd.created_at DESC;";

                var planDetails = await connection.QueryAsync<PlanDetail>(query, new { VisitId = visitId });
                var planDetail = planDetails.FirstOrDefault();
                
                if (planDetail != null)
                {
                    planDetail.Plans = await GetPlansForPlanDetailAsync(connection, planDetail.Id);
                }
                return planDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to get plan detail for visit {visitId}", ex);
            }
        }

        private async Task<ICollection<Plan>> GetPlansForPlanDetailAsync(IDbConnection connection, Guid planDetailId)
        {
            var query = @"
SELECT 
    p.id AS Id,
    p.name AS Name,
    p.notes AS Notes,
    p.created_at AS CreatedAt,
    p.updated_at AS UpdatedAt
FROM plans p
INNER JOIN plan_mapping pm ON pm.plans_id = p.id
WHERE pm.plan_detail_id = @PlanDetailId;";

            var plans = await connection.QueryAsync<Plan>(query, new { PlanDetailId = planDetailId });
            return plans.AsList();
        }

        public async Task<PlanDetail> UpdateAsync(PlanDetail planDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    planDetail.UpdatedAt = DateTimeOffset.UtcNow;

                    var setClauses = new List<string>();
                    var parameters = new DynamicParameters();
                    parameters.Add("Id", planDetail.Id);

                    if (planDetail.Notes != null)
                    {
                        setClauses.Add("notes = @Notes");
                        parameters.Add("Notes", planDetail.Notes);
                    }
                    if (planDetail.FollowUpDate != null)
                    {
                        setClauses.Add("follow_up_date = @FollowUpDate");
                        parameters.Add("FollowUpDate", planDetail.FollowUpDate); 
                    }


                    setClauses.Add("is_completed = @IsCompleted");
                    parameters.Add("IsCompleted", planDetail.IsCompleted);

                    setClauses.Add("updated_at = @UpdatedAt");
                    parameters.Add("UpdatedAt", planDetail.UpdatedAt);

                    var setClause = string.Join(", ", setClauses);
                    var query = @"
UPDATE plan_detail
SET " + setClause + @"
WHERE id = @Id
RETURNING 
    id AS Id,
    visit_id AS VisitId,
    notes AS Notes,
    is_completed AS IsCompleted,
    follow_up_date AS FollowUpDate,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var updatedPlanDetail = await connection.QuerySingleAsync<PlanDetail>(query, parameters, transaction);
                    updatedPlanDetail.Plans = await GetPlansForPlanDetailAsync(connection, updatedPlanDetail.Id);
                    transaction.Commit();
                    return updatedPlanDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for plan detail {PlanDetailId}", planDetail.Id);
                    throw new InvalidOperationException($"Failed to update plan detail with id {planDetail.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for plan detail {PlanDetailId}", planDetail.Id);
                throw new InvalidOperationException($"Failed to update plan detail with id {planDetail.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM plan_detail WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for plan detail {PlanDetailId}", id);
                throw new InvalidOperationException($"Failed to delete plan detail with id {id}", ex);
            }
        }

        public async Task<bool> AddPlanAsync(Guid planDetailId, Guid planId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
INSERT INTO plan_mapping 
(id, plan_detail_id, plans_id, created_at, updated_at) 
VALUES 
(@Id, @PlanDetailId, @PlanId, @CreatedAt, @UpdatedAt);";

                var parameters = new
                {
                    Id = Guid.NewGuid(),
                    PlanDetailId = planDetailId,
                    PlanId = planId,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                var rowsAffected = await connection.ExecuteAsync(query, parameters);
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddPlanAsync for plan detail {PlanDetailId}", planDetailId);
                throw new InvalidOperationException($"Failed to add plan for plan detail {planDetailId}", ex);
            }
        }

        public async Task<bool> RemovePlanAsync(Guid planDetailId, Guid planId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM plan_mapping WHERE plan_detail_id = @PlanDetailId AND plans_id = @PlanId;";
                var rowsAffected = await connection.ExecuteAsync(query, new { PlanDetailId = planDetailId, PlanId = planId });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RemovePlanAsync for plan detail {PlanDetailId}", planDetailId);
                throw new InvalidOperationException($"Failed to remove plan for plan detail {planDetailId}", ex);
            }
        }
    }
} 