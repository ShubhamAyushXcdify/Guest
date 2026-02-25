using System;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using System.Data;

namespace Infrastructure.Repositories
{
    public class MedicalHistoryDetailRepository : IMedicalHistoryDetailRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<MedicalHistoryDetailRepository> _logger;

        public MedicalHistoryDetailRepository(DapperDbContext dbContext, ILogger<MedicalHistoryDetailRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<MedicalHistoryDetail> CreateAsync(MedicalHistoryDetail medicalHistoryDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    medicalHistoryDetail.Id = Guid.NewGuid();
                    medicalHistoryDetail.CreatedAt = DateTimeOffset.UtcNow;
                    medicalHistoryDetail.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        medicalHistoryDetail.Id,
                        medicalHistoryDetail.PatientId,
                        medicalHistoryDetail.ChronicConditionsNotes,
                        medicalHistoryDetail.SurgeriesNotes,
                        medicalHistoryDetail.CurrentMedicationsNotes,
                        medicalHistoryDetail.GeneralNotes,
                        medicalHistoryDetail.IsCompleted,
                        medicalHistoryDetail.CreatedAt,
                        medicalHistoryDetail.UpdatedAt
                    };

                    var query = @"
INSERT INTO medical_history_details 
(id, patient_id, chronic_conditions_notes, surgeries_notes, current_medications_notes, general_notes, is_completed, created_at, updated_at) 
VALUES 
(@Id, @PatientId, @ChronicConditionsNotes, @SurgeriesNotes, @CurrentMedicationsNotes, @GeneralNotes, @IsCompleted, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    patient_id AS PatientId,
    chronic_conditions_notes AS ChronicConditionsNotes,
    surgeries_notes AS SurgeriesNotes,
    current_medications_notes AS CurrentMedicationsNotes,
    general_notes AS GeneralNotes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var createdMedicalHistoryDetail = await connection.QuerySingleAsync<MedicalHistoryDetail>(query, parameters, transaction);
                    transaction.Commit();
                    return createdMedicalHistoryDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create medical history detail", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create medical history detail", ex);
            }
        }

        public async Task<MedicalHistoryDetail> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    patient_id AS PatientId,
    chronic_conditions_notes AS ChronicConditionsNotes,
    surgeries_notes AS SurgeriesNotes,
    current_medications_notes AS CurrentMedicationsNotes,
    general_notes AS GeneralNotes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM medical_history_details
WHERE id = @Id;";

                return await connection.QuerySingleOrDefaultAsync<MedicalHistoryDetail>(query, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for medical history detail {MedicalHistoryDetailId}", id);
                throw new InvalidOperationException($"Failed to get medical history detail with id {id}", ex);
            }
        }

        public async Task<MedicalHistoryDetail> GetByPatientIdAsync(Guid patientId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    patient_id AS PatientId,
    chronic_conditions_notes AS ChronicConditionsNotes,
    surgeries_notes AS SurgeriesNotes,
    current_medications_notes AS CurrentMedicationsNotes,
    general_notes AS GeneralNotes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM medical_history_details
WHERE patient_id = @PatientId
ORDER BY created_at DESC;";

                return await connection.QuerySingleOrDefaultAsync<MedicalHistoryDetail>(query, new { PatientId = patientId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByPatientIdAsync for patient {PatientId}", patientId);
                throw new InvalidOperationException($"Failed to get medical history detail for patient {patientId}", ex);
            }
        }

        public async Task<MedicalHistoryDetail> UpdateAsync(MedicalHistoryDetail medicalHistoryDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    medicalHistoryDetail.UpdatedAt = DateTimeOffset.UtcNow;

                    var setClauses = new List<string>();
                    var parameters = new DynamicParameters();
                    parameters.Add("Id", medicalHistoryDetail.Id);

                    if (medicalHistoryDetail.ChronicConditionsNotes != null)
                    {
                        setClauses.Add("chronic_conditions_notes = @ChronicConditionsNotes");
                        parameters.Add("ChronicConditionsNotes", medicalHistoryDetail.ChronicConditionsNotes);
                    }

                    if (medicalHistoryDetail.SurgeriesNotes != null)
                    {
                        setClauses.Add("surgeries_notes = @SurgeriesNotes");
                        parameters.Add("SurgeriesNotes", medicalHistoryDetail.SurgeriesNotes);
                    }

                    if (medicalHistoryDetail.CurrentMedicationsNotes != null)
                    {
                        setClauses.Add("current_medications_notes = @CurrentMedicationsNotes");
                        parameters.Add("CurrentMedicationsNotes", medicalHistoryDetail.CurrentMedicationsNotes);
                    }

                    if (medicalHistoryDetail.GeneralNotes != null)
                    {
                        setClauses.Add("general_notes = @GeneralNotes");
                        parameters.Add("GeneralNotes", medicalHistoryDetail.GeneralNotes);
                    }

                    setClauses.Add("is_completed = @IsCompleted");
                    parameters.Add("IsCompleted", medicalHistoryDetail.IsCompleted);

                    setClauses.Add("updated_at = @UpdatedAt");
                    parameters.Add("UpdatedAt", medicalHistoryDetail.UpdatedAt);

                    var setClause = string.Join(", ", setClauses);
                    var query = @"
UPDATE medical_history_details
SET " + setClause + @"
WHERE id = @Id
RETURNING 
    id AS Id,
    patient_id AS PatientId,
    chronic_conditions_notes AS ChronicConditionsNotes,
    surgeries_notes AS SurgeriesNotes,
    current_medications_notes AS CurrentMedicationsNotes,
    general_notes AS GeneralNotes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var updatedMedicalHistoryDetail = await connection.QuerySingleAsync<MedicalHistoryDetail>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedMedicalHistoryDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for medical history detail {MedicalHistoryDetailId}", medicalHistoryDetail.Id);
                    throw new InvalidOperationException($"Failed to update medical history detail with id {medicalHistoryDetail.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for medical history detail {MedicalHistoryDetailId}", medicalHistoryDetail.Id);
                throw new InvalidOperationException($"Failed to update medical history detail with id {medicalHistoryDetail.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM medical_history_details WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for medical history detail {MedicalHistoryDetailId}", id);
                throw new InvalidOperationException($"Failed to delete medical history detail with id {id}", ex);
            }
        }
    }
} 