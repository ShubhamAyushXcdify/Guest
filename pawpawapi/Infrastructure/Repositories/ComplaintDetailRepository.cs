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
    public class ComplaintDetailRepository : IComplaintDetailRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ComplaintDetailRepository> _logger;

        public ComplaintDetailRepository(DapperDbContext dbContext, ILogger<ComplaintDetailRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ComplaintDetail> CreateAsync(ComplaintDetail complaintDetail)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Generate new ID if not provided
                if (complaintDetail.Id == Guid.Empty)
                {
                    complaintDetail.Id = Guid.NewGuid();
                }

                // Set timestamps
                complaintDetail.CreatedAt = DateTimeOffset.UtcNow;
                complaintDetail.UpdatedAt = DateTimeOffset.UtcNow;

                const string sql = @"
                    INSERT INTO complaint_detail (
                        id, visit_id, notes, is_completed, created_at, updated_at
                    ) VALUES (
                        @Id, @VisitId, @Notes, @IsCompleted, @CreatedAt, @UpdatedAt
                    )
                    RETURNING
                        id AS Id,
                        visit_id AS VisitId,
                        notes AS Notes,
                        is_completed AS IsCompleted,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt;";

                var parameters = new
                {
                    complaintDetail.Id,
                    complaintDetail.VisitId,
                    complaintDetail.Notes,
                    complaintDetail.IsCompleted,
                    complaintDetail.CreatedAt,
                    complaintDetail.UpdatedAt
                };

                var result = await connection.QuerySingleAsync<ComplaintDetail>(sql, parameters, transaction);
                result.Symptoms = new List<Symptom>();

                transaction.Commit();
                return result;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in CreateAsync for complaint detail");
                throw new InvalidOperationException("Failed to create complaint detail.", ex);
            }
        }

        public async Task<ComplaintDetail> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT
                        id AS Id,
                        visit_id AS VisitId,
                        notes AS Notes,
                        is_completed AS IsCompleted,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM complaint_detail
                    WHERE id = @Id;";

                var complaintDetail = await connection.QuerySingleOrDefaultAsync<ComplaintDetail>(sql, new { Id = id });
                if (complaintDetail != null)
                {
                    complaintDetail.Symptoms = await GetSymptomsForComplaintDetailAsync(connection, id);
                }
                return complaintDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for complaint detail {ComplaintDetailId}", id);
                throw new InvalidOperationException($"Failed to get complaint detail with id {id}.", ex);
            }
        }

        public async Task<ComplaintDetail> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT
                        id AS Id,
                        visit_id AS VisitId,
                        notes AS Notes,
                        is_completed AS IsCompleted,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM complaint_detail
                    WHERE visit_id = @VisitId
                    ORDER BY created_at DESC
                    LIMIT 1;";

                var complaintDetail = await connection.QuerySingleOrDefaultAsync<ComplaintDetail>(sql, new { VisitId = visitId });

                if (complaintDetail != null)
                {
                    complaintDetail.Symptoms = await GetSymptomsForComplaintDetailAsync(connection, complaintDetail.Id);
                }
                return complaintDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to get complaint detail for visit {visitId}.", ex);
            }
        }

        private async Task<ICollection<Symptom>> GetSymptomsForComplaintDetailAsync(IDbConnection connection, Guid complaintDetailId)
        {
            var query = @"
SELECT 
    s.id AS Id,
    s.name AS Name,
    s.notes AS notes,
    s.created_at AS CreatedAt,
    s.updated_at AS UpdatedAt
FROM symptoms s
INNER JOIN complaints_symptoms cs ON cs.symptom_id = s.id
WHERE cs.complaint_detail_id = @ComplaintDetailId;";

            var symptoms = await connection.QueryAsync<Symptom>(query, new { ComplaintDetailId = complaintDetailId });
            return symptoms.AsList();
        }

        public async Task<ComplaintDetail> UpdateAsync(ComplaintDetail complaintDetail)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Set updated timestamp
                complaintDetail.UpdatedAt = DateTimeOffset.UtcNow;

                const string sql = @"
                    UPDATE complaint_detail SET
                        notes = @Notes,
                        is_completed = @IsCompleted,
                        updated_at = @UpdatedAt
                    WHERE id = @Id
                    RETURNING
                        id AS Id,
                        visit_id AS VisitId,
                        notes AS Notes,
                        is_completed AS IsCompleted,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt;";

                var parameters = new
                {
                    complaintDetail.Id,
                    complaintDetail.Notes,
                    complaintDetail.IsCompleted,
                    complaintDetail.UpdatedAt
                };

                var result = await connection.QuerySingleOrDefaultAsync<ComplaintDetail>(sql, parameters, transaction);
                if (result == null)
                {
                    transaction.Rollback();
                    throw new KeyNotFoundException($"Complaint detail with ID {complaintDetail.Id} not found");
                }

                result.Symptoms = await GetSymptomsForComplaintDetailAsync(connection, result.Id);

                transaction.Commit();
                return result;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for complaint detail {ComplaintDetailId}", complaintDetail.Id);
                throw new InvalidOperationException("Failed to update complaint detail.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // First delete related symptoms
                const string deleteSymptomsSql = "DELETE FROM complaints_symptoms WHERE complaint_detail_id = @Id";
                await connection.ExecuteAsync(deleteSymptomsSql, new { Id = id }, transaction);

                // Then delete the complaint detail
                const string deleteComplaintSql = "DELETE FROM complaint_detail WHERE id = @Id";
                var rowsAffected = await connection.ExecuteAsync(deleteComplaintSql, new { Id = id }, transaction);

                transaction.Commit();
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in DeleteAsync for complaint detail {ComplaintDetailId}", id);
                throw new InvalidOperationException("Failed to delete complaint detail.", ex);
            }
        }

        public async Task<bool> AddSymptomAsync(Guid complaintDetailId, Guid symptomId)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                const string sql = @"
                    INSERT INTO complaints_symptoms (
                        id, complaint_detail_id, symptom_id, created_at, updated_at
                    ) VALUES (
                        @Id, @ComplaintDetailId, @SymptomId, @CreatedAt, @UpdatedAt
                    );";

                var parameters = new
                {
                    Id = Guid.NewGuid(),
                    ComplaintDetailId = complaintDetailId,
                    SymptomId = symptomId,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                var rowsAffected = await connection.ExecuteAsync(sql, parameters, transaction);
                transaction.Commit();
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in AddSymptomAsync for complaint detail {ComplaintDetailId}", complaintDetailId);
                throw new InvalidOperationException("Failed to add symptom for complaint detail.", ex);
            }
        }

        public async Task<bool> RemoveSymptomAsync(Guid complaintDetailId, Guid symptomId)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                const string sql = "DELETE FROM complaints_symptoms WHERE complaint_detail_id = @ComplaintDetailId AND symptom_id = @SymptomId";
                var rowsAffected = await connection.ExecuteAsync(sql, new { ComplaintDetailId = complaintDetailId, SymptomId = symptomId }, transaction);
                transaction.Commit();
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in RemoveSymptomAsync for complaint detail {ComplaintDetailId}", complaintDetailId);
                throw new InvalidOperationException("Failed to remove symptom for complaint detail.", ex);
            }
        }
    }
} 