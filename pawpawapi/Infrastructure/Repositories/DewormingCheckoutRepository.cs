using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class DewormingCheckoutRepository : IDewormingCheckoutRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<DewormingCheckoutRepository> _logger;

        public DewormingCheckoutRepository(DapperDbContext dbContext, ILogger<DewormingCheckoutRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<DewormingCheckout?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
SELECT 
    id AS Id,
    visit_id AS VisitId,
    summary AS Summary,
    next_deworming_due_date AS NextDewormingDueDate,
    home_care_instructions AS HomeCareInstructions,
    client_acknowledged AS ClientAcknowledged,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM deworming_checkout WHERE id = @Id;";
                return await connection.QuerySingleOrDefaultAsync<DewormingCheckout>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for DewormingCheckout {CheckoutId}", id);
                throw new InvalidOperationException($"Failed to get DewormingCheckout with id {id}", ex);
            }
        }

        public async Task<IEnumerable<DewormingCheckout>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
SELECT 
    id AS Id,
    visit_id AS VisitId,
    summary AS Summary,
    next_deworming_due_date AS NextDewormingDueDate,
    home_care_instructions AS HomeCareInstructions,
    client_acknowledged AS ClientAcknowledged,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM deworming_checkout WHERE visit_id = @VisitId;";
                return await connection.QueryAsync<DewormingCheckout>(sql, new { VisitId = visitId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for DewormingCheckout {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to get DewormingCheckouts for visit {visitId}", ex);
            }
        }

        public async Task<DewormingCheckout> CreateAsync(DewormingCheckout checkout)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                using var transaction = connection.BeginTransaction();
                try
                {
                    // Generate new ID if not provided
                    if (checkout.Id == Guid.Empty)
                    {
                        checkout.Id = Guid.NewGuid();
                    }

                    // Set timestamps
                    checkout.CreatedAt = DateTime.UtcNow;
                    checkout.UpdatedAt = DateTime.UtcNow;

                    const string sql = @"
INSERT INTO deworming_checkout (
    id, visit_id, summary, next_deworming_due_date, home_care_instructions, client_acknowledged, is_completed, created_at, updated_at
) VALUES (
    @Id, @VisitId, @Summary, @NextDewormingDueDate, @HomeCareInstructions, @ClientAcknowledged, @IsCompleted, @CreatedAt, @UpdatedAt
) RETURNING 
    id AS Id,
    visit_id AS VisitId,
    summary AS Summary,
    next_deworming_due_date AS NextDewormingDueDate,
    home_care_instructions AS HomeCareInstructions,
    client_acknowledged AS ClientAcknowledged,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";
                    var created = await connection.QuerySingleAsync<DewormingCheckout>(sql, checkout, transaction);
                    transaction.Commit();
                    return created;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction for DewormingCheckout");
                    throw new InvalidOperationException("Failed to create DewormingCheckout", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync for DewormingCheckout");
                throw new InvalidOperationException("Failed to create DewormingCheckout", ex);
            }
        }

        public async Task<DewormingCheckout> UpdateAsync(DewormingCheckout checkout)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                using var transaction = connection.BeginTransaction();
                try
                {
                    // Set updated timestamp
                    checkout.UpdatedAt = DateTime.UtcNow;

                    const string sql = @"
UPDATE deworming_checkout SET
    summary = @Summary,
    next_deworming_due_date = @NextDewormingDueDate,
    home_care_instructions = @HomeCareInstructions,
    client_acknowledged = @ClientAcknowledged,
    is_completed = @IsCompleted,
    updated_at = @UpdatedAt
WHERE id = @Id
RETURNING 
    id AS Id,
    visit_id AS VisitId,
    summary AS Summary,
    next_deworming_due_date AS NextDewormingDueDate,
    home_care_instructions AS HomeCareInstructions,
    client_acknowledged AS ClientAcknowledged,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";
                    var updated = await connection.QuerySingleAsync<DewormingCheckout>(sql, checkout, transaction);
                    transaction.Commit();
                    return updated;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for DewormingCheckout {CheckoutId}", checkout.Id);
                    throw new InvalidOperationException($"Failed to update DewormingCheckout with id {checkout.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for DewormingCheckout {CheckoutId}", checkout.Id);
                throw new InvalidOperationException($"Failed to update DewormingCheckout with id {checkout.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = "DELETE FROM deworming_checkout WHERE id = @Id;";
                var rows = await connection.ExecuteAsync(sql, new { Id = id });
                return rows > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for DewormingCheckout {CheckoutId}", id);
                throw new InvalidOperationException($"Failed to delete DewormingCheckout with id {id}", ex);
            }
        }
    }
} 