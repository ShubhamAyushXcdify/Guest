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
    public class DewormingMedicationRepository : IDewormingMedicationRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<DewormingMedicationRepository> _logger;

        public DewormingMedicationRepository(DapperDbContext dbContext, ILogger<DewormingMedicationRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<DewormingMedication?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT
                        id AS Id,
                        visit_id AS VisitId,
                        route AS Route,
                        date_time_given AS DateTimeGiven,
                        veterinarian_name AS VeterinarianName,
                        administered_by AS AdministeredBy,
                        remarks AS Remarks,
                        is_completed AS IsCompleted,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM deworming_medication
                    WHERE id = @Id;";

                var medication = await connection.QuerySingleOrDefaultAsync<DewormingMedication>(sql, new { Id = id });
                return medication;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for DewormingMedication {MedicationId}", id);
                throw new InvalidOperationException($"Failed to get DewormingMedication with id {id}", ex);
            }
        }

        public async Task<IEnumerable<DewormingMedication>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                const string sql = @"
                    SELECT 
                        id AS Id,
                        visit_id AS VisitId,
                        route AS Route,
                        date_time_given AS DateTimeGiven,
                        veterinarian_name AS VeterinarianName,
                        administered_by AS AdministeredBy,
                        remarks AS Remarks,
                        is_completed AS IsCompleted,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM deworming_medication 
                    WHERE visit_id = @VisitId;";
                
                var medications = await connection.QueryAsync<DewormingMedication>(sql, new { VisitId = visitId });
                return medications;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to get DewormingMedications for visit {visitId}", ex);
            }
        }

        public async Task<DewormingMedication> CreateAsync(DewormingMedication medication)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Generate new ID if not provided
                if (medication.Id == Guid.Empty)
                {
                    medication.Id = Guid.NewGuid();
                }

                // Set timestamps
                medication.CreatedAt = DateTime.UtcNow;
                medication.UpdatedAt = DateTime.UtcNow;

                const string sql = @"
                    INSERT INTO deworming_medication (
                        id, visit_id, route, date_time_given, veterinarian_name,
                        administered_by, remarks, is_completed, created_at, updated_at
                    ) VALUES (
                        @Id, @VisitId, @Route, @DateTimeGiven, @VeterinarianName,
                        @AdministeredBy, @Remarks, @IsCompleted, @CreatedAt, @UpdatedAt
                    ) RETURNING
                        id AS Id,
                        visit_id AS VisitId,
                        route AS Route,
                        date_time_given AS DateTimeGiven,
                        veterinarian_name AS VeterinarianName,
                        administered_by AS AdministeredBy,
                        remarks AS Remarks,
                        is_completed AS IsCompleted,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt;";

                var parameters = new
                {
                    medication.Id,
                    medication.VisitId,
                    medication.Route,
                    medication.DateTimeGiven,
                    medication.VeterinarianName,
                    medication.AdministeredBy,
                    medication.Remarks,
                    IsCompleted = medication.IsCompleted,
                    medication.CreatedAt,
                    medication.UpdatedAt
                };

                var createdMedication = await connection.QuerySingleAsync<DewormingMedication>(sql, parameters, transaction);
                transaction.Commit();

                return createdMedication;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in CreateAsync for DewormingMedication");
                throw new InvalidOperationException("Failed to create DewormingMedication", ex);
            }
        }

        public async Task<DewormingMedication> UpdateAsync(DewormingMedication medication)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Set updated timestamp
                medication.UpdatedAt = DateTime.UtcNow;

                const string sql = @"
                    UPDATE deworming_medication SET
                        route = @Route,
                        date_time_given = @DateTimeGiven,
                        veterinarian_name = @VeterinarianName,
                        administered_by = @AdministeredBy,
                        remarks = @Remarks,
                        is_completed = @IsCompleted,
                        updated_at = @UpdatedAt
                    WHERE id = @Id
                    RETURNING
                        id AS Id,
                        visit_id AS VisitId,
                        route AS Route,
                        date_time_given AS DateTimeGiven,
                        veterinarian_name AS VeterinarianName,
                        administered_by AS AdministeredBy,
                        remarks AS Remarks,
                        is_completed AS IsCompleted,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt;";

                var parameters = new
                {
                    medication.Id,
                    medication.Route,
                    medication.DateTimeGiven,
                    medication.VeterinarianName,
                    medication.AdministeredBy,
                    medication.Remarks,
                    IsCompleted = medication.IsCompleted,
                    medication.UpdatedAt
                };

                var updatedMedication = await connection.QuerySingleAsync<DewormingMedication>(sql, parameters, transaction);
                transaction.Commit();

                return updatedMedication;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for DewormingMedication {MedicationId}", medication.Id);
                throw new InvalidOperationException($"Failed to update DewormingMedication with id {medication.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = "DELETE FROM deworming_medication WHERE id = @Id;";
                var rows = await connection.ExecuteAsync(sql, new { Id = id });
                return rows > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for DewormingMedication {MedicationId}", id);
                throw new InvalidOperationException($"Failed to delete DewormingMedication with id {id}", ex);
            }
        }
    }
} 