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
    public class MedicalRecordRepository : IMedicalRecordRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<MedicalRecordRepository> _logger;

        public MedicalRecordRepository(DapperDbContext dbContext, ILogger<MedicalRecordRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<MedicalRecord> CreateAsync(MedicalRecord medicalRecord)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    medicalRecord.Id = Guid.NewGuid();
                    medicalRecord.CreatedAt = DateTimeOffset.UtcNow;
                    medicalRecord.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        medicalRecord.Id,
                        medicalRecord.ClinicId,
                        medicalRecord.PatientId,
                        medicalRecord.AppointmentId,
                        medicalRecord.VeterinarianId,
                        medicalRecord.VisitDate,
                        medicalRecord.ChiefComplaint,
                        medicalRecord.History,
                        medicalRecord.PhysicalExamFindings,
                        medicalRecord.Diagnosis,
                        medicalRecord.TreatmentPlan,
                        medicalRecord.FollowUpInstructions,
                        medicalRecord.WeightKg,
                        medicalRecord.TemperatureCelsius,
                        medicalRecord.HeartRate,
                        medicalRecord.RespiratoryRate,
                        medicalRecord.CreatedAt,
                        medicalRecord.UpdatedAt
                    };

                    var query = @"
INSERT INTO medical_records 
(id, clinic_id, patient_id, appointment_id, veterinarian_id, visit_date, chief_complaint, history, 
physical_exam_findings, diagnosis, treatment_plan, follow_up_instructions, weight_kg, temperature_celsius, 
heart_rate, respiratory_rate, created_at, updated_at) 
VALUES 
(@Id, @ClinicId, @PatientId, @AppointmentId, @VeterinarianId, @VisitDate, @ChiefComplaint, @History, 
@PhysicalExamFindings, @Diagnosis, @TreatmentPlan, @FollowUpInstructions, @WeightKg, @TemperatureCelsius, 
@HeartRate, @RespiratoryRate, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    clinic_id AS ClinicId,
    patient_id AS PatientId,
    appointment_id AS AppointmentId,
    veterinarian_id AS VeterinarianId,
    visit_date AS VisitDate,
    chief_complaint AS ChiefComplaint,
    history AS History,
    physical_exam_findings AS PhysicalExamFindings,
    diagnosis AS Diagnosis,
    treatment_plan AS TreatmentPlan,
    follow_up_instructions AS FollowUpInstructions,
    weight_kg AS WeightKg,
    temperature_celsius AS TemperatureCelsius,
    heart_rate AS HeartRate,
    respiratory_rate AS RespiratoryRate,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var createdMedicalRecord = await connection.QuerySingleAsync<MedicalRecord>(query, parameters, transaction);
                    transaction.Commit();
                    return createdMedicalRecord;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create medical record", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create medical record", ex);
            }
        }

        public async Task<MedicalRecord> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    clinic_id AS ClinicId,
    patient_id AS PatientId,
    appointment_id AS AppointmentId,
    veterinarian_id AS VeterinarianId,
    visit_date AS VisitDate,
    chief_complaint AS ChiefComplaint,
    history AS History,
    physical_exam_findings AS PhysicalExamFindings,
    diagnosis AS Diagnosis,
    treatment_plan AS TreatmentPlan,
    follow_up_instructions AS FollowUpInstructions,
    weight_kg AS WeightKg,
    temperature_celsius AS TemperatureCelsius,
    heart_rate AS HeartRate,
    respiratory_rate AS RespiratoryRate,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM medical_records 
WHERE id = @Id;";

                var medicalRecord = await connection.QuerySingleOrDefaultAsync<MedicalRecord>(query, new { Id = id });
                return medicalRecord;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for medical record {MedicalRecordId}", id);
                throw new InvalidOperationException($"Failed to get medical record with id {id}", ex);
            }
        }

        public async Task<(IEnumerable<MedicalRecord> Items, int TotalCount)> GetAllAsync(
            int pageNumber, 
            int pageSize,
            Guid? clinicId = null,
            Guid? patientId = null,
            Guid? appointmentId = null,
            Guid? veterinarianId = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (clinicId.HasValue)
                {
                    whereClauses.Add("clinic_id = @ClinicId");
                    parameters.Add("ClinicId", clinicId.Value);
                }

                if (patientId.HasValue)
                {
                    whereClauses.Add("patient_id = @PatientId");
                    parameters.Add("PatientId", patientId.Value);
                }

                if (appointmentId.HasValue)
                {
                    whereClauses.Add("appointment_id = @AppointmentId");
                    parameters.Add("AppointmentId", appointmentId.Value);
                }

                if (veterinarianId.HasValue)
                {
                    whereClauses.Add("veterinarian_id = @VeterinarianId");
                    parameters.Add("VeterinarianId", veterinarianId.Value);
                }

                if (dateFrom.HasValue)
                {
                    whereClauses.Add("visit_date >= @DateFrom");
                    parameters.Add("DateFrom", dateFrom.Value.Date);
                }

                if (dateTo.HasValue)
                {
                    whereClauses.Add("visit_date <= @DateTo");
                    parameters.Add("DateTo", dateTo.Value.Date);
                }

                var whereClause = whereClauses.Count > 0 
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                // Get total count with filters
                var countQuery = $"SELECT COUNT(*) FROM medical_records {whereClause};";
                var totalCount = await connection.ExecuteScalarAsync<int>(countQuery, parameters);

                // Get paginated data with filters
                var query = $@"
SELECT 
    id AS Id,
    clinic_id AS ClinicId,
    patient_id AS PatientId,
    appointment_id AS AppointmentId,
    veterinarian_id AS VeterinarianId,
    visit_date AS VisitDate,
    chief_complaint AS ChiefComplaint,
    history AS History,
    physical_exam_findings AS PhysicalExamFindings,
    diagnosis AS Diagnosis,
    treatment_plan AS TreatmentPlan,
    follow_up_instructions AS FollowUpInstructions,
    weight_kg AS WeightKg,
    temperature_celsius AS TemperatureCelsius,
    heart_rate AS HeartRate,
    respiratory_rate AS RespiratoryRate,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM medical_records
{whereClause}
ORDER BY created_at DESC
LIMIT @PageSize
OFFSET @Offset;";

                parameters.Add("PageSize", pageSize);
                parameters.Add("Offset", (pageNumber - 1) * pageSize);
                
                var medicalRecords = await connection.QueryAsync<MedicalRecord>(query, parameters);
                
                return (medicalRecords, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get all medical records", ex);
            }
        }

        public async Task<MedicalRecord> UpdateAsync(MedicalRecord medicalRecord)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    medicalRecord.UpdatedAt = DateTimeOffset.UtcNow;

                    var setClauses = new List<string>();
                    var parameters = new DynamicParameters();
                    parameters.Add("Id", medicalRecord.Id);

                    if (medicalRecord.ClinicId.HasValue)
                    {
                        setClauses.Add("clinic_id = @ClinicId");
                        parameters.Add("ClinicId", medicalRecord.ClinicId);
                    }

                    if (medicalRecord.PatientId.HasValue)
                    {
                        setClauses.Add("patient_id = @PatientId");
                        parameters.Add("PatientId", medicalRecord.PatientId);
                    }

                    if (medicalRecord.AppointmentId.HasValue)
                    {
                        setClauses.Add("appointment_id = @AppointmentId");
                        parameters.Add("AppointmentId", medicalRecord.AppointmentId);
                    }

                    if (medicalRecord.VeterinarianId.HasValue)
                    {
                        setClauses.Add("veterinarian_id = @VeterinarianId");
                        parameters.Add("VeterinarianId", medicalRecord.VeterinarianId);
                    }

                    setClauses.Add("visit_date = @VisitDate");
                    parameters.Add("VisitDate", medicalRecord.VisitDate);

                    if (!string.IsNullOrWhiteSpace(medicalRecord.ChiefComplaint))
                    {
                        setClauses.Add("chief_complaint = @ChiefComplaint");
                        parameters.Add("ChiefComplaint", medicalRecord.ChiefComplaint);
                    }

                    if (!string.IsNullOrWhiteSpace(medicalRecord.History))
                    {
                        setClauses.Add("history = @History");
                        parameters.Add("History", medicalRecord.History);
                    }

                    if (!string.IsNullOrWhiteSpace(medicalRecord.PhysicalExamFindings))
                    {
                        setClauses.Add("physical_exam_findings = @PhysicalExamFindings");
                        parameters.Add("PhysicalExamFindings", medicalRecord.PhysicalExamFindings);
                    }

                    if (!string.IsNullOrWhiteSpace(medicalRecord.Diagnosis))
                    {
                        setClauses.Add("diagnosis = @Diagnosis");
                        parameters.Add("Diagnosis", medicalRecord.Diagnosis);
                    }

                    if (!string.IsNullOrWhiteSpace(medicalRecord.TreatmentPlan))
                    {
                        setClauses.Add("treatment_plan = @TreatmentPlan");
                        parameters.Add("TreatmentPlan", medicalRecord.TreatmentPlan);
                    }

                    if (!string.IsNullOrWhiteSpace(medicalRecord.FollowUpInstructions))
                    {
                        setClauses.Add("follow_up_instructions = @FollowUpInstructions");
                        parameters.Add("FollowUpInstructions", medicalRecord.FollowUpInstructions);
                    }

                    if (medicalRecord.WeightKg.HasValue)
                    {
                        setClauses.Add("weight_kg = @WeightKg");
                        parameters.Add("WeightKg", medicalRecord.WeightKg);
                    }

                    if (medicalRecord.TemperatureCelsius.HasValue)
                    {
                        setClauses.Add("temperature_celsius = @TemperatureCelsius");
                        parameters.Add("TemperatureCelsius", medicalRecord.TemperatureCelsius);
                    }

                    if (medicalRecord.HeartRate.HasValue)
                    {
                        setClauses.Add("heart_rate = @HeartRate");
                        parameters.Add("HeartRate", medicalRecord.HeartRate);
                    }

                    if (medicalRecord.RespiratoryRate.HasValue)
                    {
                        setClauses.Add("respiratory_rate = @RespiratoryRate");
                        parameters.Add("RespiratoryRate", medicalRecord.RespiratoryRate);
                    }

                    setClauses.Add("updated_at = @UpdatedAt");
                    parameters.Add("UpdatedAt", medicalRecord.UpdatedAt);

                    var setClause = string.Join(", ", setClauses);
                    var query = @"
UPDATE medical_records
SET " + setClause + @"
WHERE id = @Id
RETURNING 
    id AS Id,
    clinic_id AS ClinicId,
    patient_id AS PatientId,
    appointment_id AS AppointmentId,
    veterinarian_id AS VeterinarianId,
    visit_date AS VisitDate,
    chief_complaint AS ChiefComplaint,
    history AS History,
    physical_exam_findings AS PhysicalExamFindings,
    diagnosis AS Diagnosis,
    treatment_plan AS TreatmentPlan,
    follow_up_instructions AS FollowUpInstructions,
    weight_kg AS WeightKg,
    temperature_celsius AS TemperatureCelsius,
    heart_rate AS HeartRate,
    respiratory_rate AS RespiratoryRate,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var updatedMedicalRecord = await connection.QuerySingleAsync<MedicalRecord>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedMedicalRecord;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for medical record {MedicalRecordId}", medicalRecord.Id);
                    throw new InvalidOperationException($"Failed to update medical record with id {medicalRecord.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for medical record {MedicalRecordId}", medicalRecord.Id);
                throw new InvalidOperationException($"Failed to update medical record with id {medicalRecord.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM medical_records WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for medical record {MedicalRecordId}", id);
                throw new InvalidOperationException($"Failed to delete medical record with id {id}", ex);
            }
        }
    }
} 