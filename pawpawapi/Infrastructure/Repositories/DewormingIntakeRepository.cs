using System;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class DewormingIntakeRepository : IDewormingIntakeRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<DewormingIntakeRepository> _logger;

        public DewormingIntakeRepository(DapperDbContext dbContext, ILogger<DewormingIntakeRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<DewormingIntake> CreateAsync(DewormingIntake intake)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Generate new ID if not provided
                if (intake.Id == Guid.Empty)
                {
                    intake.Id = Guid.NewGuid();
                }

                // Set timestamps
                intake.CreatedAt = DateTime.UtcNow;
                intake.UpdatedAt = DateTime.UtcNow;

                const string sql = @"
                    INSERT INTO deworming_intake (
                        id, visit_id, weight_kg, last_deworming_date, symptoms_notes,
                        temperature_c, appetite_feeding_notes, current_medications,
                        is_stool_sample_collected, is_completed, created_at, updated_at
                    ) VALUES (
                        @Id, @VisitId, @WeightKg, @LastDewormingDate, @SymptomsNotes,
                        @TemperatureC, @AppetiteFeedingNotes, @CurrentMedications,
                        @IsStoolSampleCollected, @IsCompleted, @CreatedAt, @UpdatedAt
                    )
                    RETURNING
                        id, visit_id, weight_kg, last_deworming_date, symptoms_notes,
                        temperature_c, appetite_feeding_notes, current_medications,
                        is_stool_sample_collected, is_completed, created_at, updated_at;";

                var parameters = new
                {
                    intake.Id,
                    intake.VisitId,
                    intake.WeightKg,
                    intake.LastDewormingDate,
                    intake.SymptomsNotes,
                    intake.TemperatureC,
                    intake.AppetiteFeedingNotes,
                    intake.CurrentMedications,
                    intake.IsStoolSampleCollected,
                    intake.IsCompleted,
                    intake.CreatedAt,
                    intake.UpdatedAt
                };

                var result = await connection.QuerySingleAsync<DewormingIntake>(sql, parameters, transaction);
                transaction.Commit();
                return result;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in CreateAsync for deworming intake");
                throw new InvalidOperationException("Failed to create deworming intake.", ex);
            }
        }


        public async Task<DewormingIntake?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT
                        id, visit_id, weight_kg, last_deworming_date, symptoms_notes,
                        temperature_c, appetite_feeding_notes, current_medications,
                        is_stool_sample_collected, is_completed, created_at, updated_at
                    FROM deworming_intake
                    WHERE id = @Id;";

                return await connection.QuerySingleOrDefaultAsync<DewormingIntake>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for deworming intake {Id}", id);
                return null;
            }
        }

        public async Task<DewormingIntake?> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT
                        id, visit_id, weight_kg, last_deworming_date, symptoms_notes,
                        temperature_c, appetite_feeding_notes, current_medications,
                        is_stool_sample_collected, is_completed, created_at, updated_at
                    FROM deworming_intake
                    WHERE visit_id = @VisitId;";

                return await connection.QuerySingleOrDefaultAsync<DewormingIntake>(sql, new { VisitId = visitId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for deworming intake with visit {VisitId}", visitId);
                return null;
            }
        }


        public async Task<DewormingIntake> UpdateAsync(DewormingIntake intake)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            intake.UpdatedAt = DateTime.UtcNow;
            const string query = @"
UPDATE deworming_intake SET
    weight_kg = @WeightKg,
    last_deworming_date = @LastDewormingDate,
    symptoms_notes = @SymptomsNotes,
    temperature_c = @TemperatureC,
    appetite_feeding_notes = @AppetiteFeedingNotes,
    current_medications = @CurrentMedications,
    is_stool_sample_collected = @IsStoolSampleCollected,
    is_completed = @IsCompleted,
    updated_at = @UpdatedAt
WHERE id = @Id
RETURNING id, visit_id, weight_kg, last_deworming_date, symptoms_notes, temperature_c, appetite_feeding_notes, current_medications, is_stool_sample_collected, is_completed, created_at, updated_at;";
            return await connection.QuerySingleAsync<DewormingIntake>(query, intake);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            const string query = @"DELETE FROM deworming_intake WHERE id = @Id;";
            var affected = await connection.ExecuteAsync(query, new { Id = id });
            return affected > 0;
        }
    }
} 