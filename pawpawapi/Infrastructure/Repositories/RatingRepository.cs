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
    public class RatingRepository : IRatingRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<RatingRepository> _logger;

        public RatingRepository(DapperDbContext dbContext, ILogger<RatingRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Rating> CreateAsync(Rating rating)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    var parameters = new
                    {
                        rating.Id,
                        rating.AppointmentId,
                        RatingValue = rating.RatingValue,
                        rating.Feedback,
                        rating.CreatedAt,
                        rating.UpdatedAt
                    };

                    var query = @"
                    INSERT INTO ratings
                    (id, appointment_id, rating, feedback, created_at, updated_at)
                    VALUES
                    (@Id, @AppointmentId, @RatingValue, @Feedback, @CreatedAt, @UpdatedAt)
                    RETURNING
                        id AS Id,
                        appointment_id AS AppointmentId,
                        rating AS RatingValue,
                        feedback AS Feedback,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt;";

                    var createdRating = await connection.QuerySingleAsync<Rating>(query, parameters, transaction);
                    transaction.Commit();
                    return createdRating;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create rating", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create rating", ex);
            }
        }

        public async Task<Rating> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
                    SELECT 
                        id AS Id,
                        appointment_id AS AppointmentId,
                        rating AS RatingValue,
                        feedback AS Feedback,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM ratings 
                    WHERE id = @Id;";

                var rating = await connection.QuerySingleOrDefaultAsync<Rating>(query, new { Id = id });
                return rating;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for rating {RatingId}", id);
                throw new InvalidOperationException($"Failed to get rating with id {id}", ex);
            }
        }

        public async Task<IEnumerable<Rating>> GetAllAsync()
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
                    SELECT 
                        id AS Id,
                        appointment_id AS AppointmentId,
                        rating AS RatingValue,
                        feedback AS Feedback,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM ratings
                    ORDER BY created_at DESC;";

                var ratings = await connection.QueryAsync<Rating>(query);
                return ratings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get all ratings", ex);
            }
        }

        public async Task<Rating> UpdateAsync(Rating rating)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    var setClauses = new List<string>();
                    var parameters = new DynamicParameters();
                    parameters.Add("Id", rating.Id);

                    if (rating.AppointmentId != Guid.Empty)
                    {
                        setClauses.Add("appointment_id = @AppointmentId");
                        parameters.Add("AppointmentId", rating.AppointmentId);
                    }

                    if (rating.RatingValue != 0)
                    {
                        setClauses.Add("rating = @RatingValue");
                        parameters.Add("RatingValue", rating.RatingValue);
                    }

                    if (rating.Feedback != null)
                    {
                        setClauses.Add("feedback = @Feedback");
                        parameters.Add("Feedback", rating.Feedback);
                    }

                    setClauses.Add("updated_at = CURRENT_TIMESTAMP");

                    if (setClauses.Count == 1) // Only updated_at, nothing else changed
                        throw new InvalidOperationException("No fields to update.");

                    var setClause = string.Join(", ", setClauses);
                    var query = @"
                    UPDATE ratings
                    SET " + setClause + @"
                    WHERE id = @Id
                    RETURNING 
                        id AS Id,
                        appointment_id AS AppointmentId,
                        rating AS RatingValue,
                        feedback AS Feedback,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt;";

                    var updatedRating = await connection.QuerySingleAsync<Rating>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedRating;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for rating {RatingId}", rating.Id);
                    throw new InvalidOperationException($"Failed to update rating with id {rating.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for rating {RatingId}", rating.Id);
                throw new InvalidOperationException($"Failed to update rating with id {rating.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM ratings WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for rating {RatingId}", id);
                throw new InvalidOperationException($"Failed to delete rating with id {id}", ex);
            }
        }
    }
}
