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
    public class VisitRepository : IVisitRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<VisitRepository> _logger;

        public VisitRepository(DapperDbContext dbContext, ILogger<VisitRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Visit?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT 
                        id as Id,
                        appointment_id as AppointmentId,
                        patient_id as PatientId,
                        is_intake_completed as IsIntakeCompleted,
                        is_complaints_completed as IsComplaintsCompleted,
                        is_vitals_completed as IsVitalsCompleted,
                        is_plan_completed as IsPlanCompleted,
                        is_prescription_completed as IsPrescriptionCompleted,
                        is_procedure_completed as IsProceduresCompleted,
                        is_vaccination_detail_completed as IsVaccinationDetailCompleted,
                        is_emergency_triage_completed as IsEmergencyTriageCompleted,
                        is_emergency_vital_completed as IsEmergencyVitalCompleted,
                        is_emergency_procedure_completed as IsEmergencyProcedureCompleted,
                        is_emergency_discharge_completed as IsEmergencyDischargeCompleted,
                        is_surgery_pre_op_completed as IsSurgeryPreOpCompleted,
                        is_surgery_details_completed as IsSurgeryDetailsCompleted,
                        is_surgery_post_op_completed as IsSurgeryPostOpCompleted,
                        is_surgery_discharge_completed as IsSurgeryDischargeCompleted,
                        is_deworming_intake_completed as IsDewormingIntakeCompleted,
                        is_deworming_medication_completed as IsDewormingMedicationCompleted,
                        is_deworming_notes_completed as IsDewormingNotesCompleted,
                        is_deworming_checkout_completed as IsDewormingCheckoutCompleted,
                        created_at as CreatedAt,
                        updated_at as UpdatedAt
                    FROM visits WHERE id = @Id";
                return await connection.QueryFirstOrDefaultAsync<Visit>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync");
                throw;
            }
        }

        public async Task<(IEnumerable<Visit> Items, int TotalCount)> GetAllAsync(int pageNumber, int pageSize, bool paginationRequired = true)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string countSql = "SELECT COUNT(*) FROM visits";
                var totalCount = await connection.ExecuteScalarAsync<int>(countSql);

                var sql = @"
                    SELECT 
                        id as Id,
                        appointment_id as AppointmentId,
                        patient_id as PatientId,
                        is_intake_completed as IsIntakeCompleted,
                        is_complaints_completed as IsComplaintsCompleted,
                        is_vitals_completed as IsVitalsCompleted,
                        is_plan_completed as IsPlanCompleted,
                        is_prescription_completed as IsPrescriptionCompleted,
                        is_procedure_completed as IsProceduresCompleted,
                        is_vaccination_detail_completed as IsVaccinationDetailCompleted,
                        is_emergency_triage_completed as IsEmergencyTriageCompleted,
                        is_emergency_vital_completed as IsEmergencyVitalCompleted,
                        is_emergency_procedure_completed as IsEmergencyProcedureCompleted,
                        is_emergency_discharge_completed as IsEmergencyDischargeCompleted,
                        is_surgery_pre_op_completed as IsSurgeryPreOpCompleted,
                        is_surgery_details_completed as IsSurgeryDetailsCompleted,
                        is_surgery_post_op_completed as IsSurgeryPostOpCompleted,
                        is_surgery_discharge_completed as IsSurgeryDischargeCompleted,
                        is_deworming_intake_completed as IsDewormingIntakeCompleted,
                        is_deworming_medication_completed as IsDewormingMedicationCompleted,
                        is_deworming_notes_completed as IsDewormingNotesCompleted,
                        is_deworming_checkout_completed as IsDewormingCheckoutCompleted,
                        created_at as CreatedAt,
                        updated_at as UpdatedAt
                    FROM visits ORDER BY created_at DESC";
                if (paginationRequired)
                {
                    var offset = (pageNumber - 1) * pageSize;
                    sql += " LIMIT @PageSize OFFSET @Offset";
                    return (await connection.QueryAsync<Visit>(sql, new { PageSize = pageSize, Offset = offset }), totalCount);
                }
                return (await connection.QueryAsync<Visit>(sql), totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<Visit> AddAsync(Visit visit)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                if (visit.Id == Guid.Empty)
                {
                    visit.Id = Guid.NewGuid();
                }
                visit.CreatedAt = DateTimeOffset.UtcNow;
                visit.UpdatedAt = DateTimeOffset.UtcNow;
                const string sql = @"
                    INSERT INTO visits (id, appointment_id, patient_id, is_intake_completed, is_complaints_completed, is_vitals_completed, is_plan_completed, is_prescription_completed, is_procedure_completed, is_vaccination_detail_completed, is_emergency_triage_completed, is_emergency_vital_completed, is_emergency_procedure_completed, is_emergency_discharge_completed, is_surgery_pre_op_completed, is_surgery_details_completed, is_surgery_post_op_completed, is_surgery_discharge_completed,
                    is_deworming_intake_completed, is_deworming_medication_completed, is_deworming_notes_completed, is_deworming_checkout_completed,
                    created_at, updated_at)
                    VALUES (@Id, @AppointmentId, @PatientId, @IsIntakeCompleted, @IsComplaintsCompleted, @IsVitalsCompleted, @IsPlanCompleted, @IsPrescriptionCompleted, @IsProceduresCompleted, @IsVaccinationDetailCompleted, @IsEmergencyTriageCompleted, @IsEmergencyVitalCompleted, @IsEmergencyProcedureCompleted, @IsEmergencyDischargeCompleted, @IsSurgeryPreOpCompleted, @IsSurgeryDetailsCompleted, @IsSurgeryPostOpCompleted, @IsSurgeryDischargeCompleted,
                    @IsDewormingIntakeCompleted, @IsDewormingMedicationCompleted, @IsDewormingNotesCompleted, @IsDewormingCheckoutCompleted,
                    @CreatedAt, @UpdatedAt)
                    RETURNING *;";
                return await connection.QuerySingleAsync<Visit>(sql, visit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddAsync");
                throw;
            }
        }

        public async Task<Visit> UpdateAsync(Visit visit)
        {
            try
            {   
                using var connection = _dbContext.GetConnection();
                visit.UpdatedAt = DateTimeOffset.UtcNow;
                const string sql = @"
                    UPDATE visits
                    SET is_intake_completed = @IsIntakeCompleted, 
                        is_complaints_completed = @IsComplaintsCompleted,
                        is_vitals_completed = @IsVitalsCompleted,
                        is_plan_completed = @IsPlanCompleted,
                        is_prescription_completed = @IsPrescriptionCompleted,
                        is_procedure_completed = @IsProceduresCompleted,
                        is_vaccination_detail_completed = @IsVaccinationDetailCompleted,
                        is_emergency_triage_completed = @IsEmergencyTriageCompleted,
                        is_emergency_vital_completed = @IsEmergencyVitalCompleted,
                        is_emergency_procedure_completed = @IsEmergencyProcedureCompleted,
                        is_emergency_discharge_completed = @IsEmergencyDischargeCompleted,
                        is_surgery_pre_op_completed = @IsSurgeryPreOpCompleted,
                        is_surgery_details_completed = @IsSurgeryDetailsCompleted,
                        is_surgery_post_op_completed = @IsSurgeryPostOpCompleted,
                        is_surgery_discharge_completed = @IsSurgeryDischargeCompleted,
                        is_deworming_intake_completed = @IsDewormingIntakeCompleted,
                        is_deworming_medication_completed = @IsDewormingMedicationCompleted,
                        is_deworming_notes_completed = @IsDewormingNotesCompleted,
                        is_deworming_checkout_completed = @IsDewormingCheckoutCompleted,
                        patient_id = @PatientId,
                        updated_at = @UpdatedAt
                    WHERE id = @Id
                    RETURNING *;";
                return await connection.QuerySingleAsync<Visit>(sql, visit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = "DELETE FROM visits WHERE id = @Id";
                var rows = await connection.ExecuteAsync(sql, new { Id = id });
                return rows > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync");
                throw;
            }
        }

        public async Task<Visit?> GetByAppointmentIdAsync(Guid appointmentId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT 
                        id as Id,
                        appointment_id as AppointmentId,
                        patient_id as PatientId,
                        is_intake_completed as IsIntakeCompleted,
                        is_complaints_completed as IsComplaintsCompleted,
                        is_vitals_completed as IsVitalsCompleted,
                        is_plan_completed as IsPlanCompleted,
                        is_prescription_completed as IsPrescriptionCompleted,
                        is_procedure_completed as IsProceduresCompleted,
                        is_vaccination_detail_completed as IsVaccinationDetailCompleted,
                        is_emergency_triage_completed as IsEmergencyTriageCompleted,
                        is_emergency_vital_completed as IsEmergencyVitalCompleted,
                        is_emergency_procedure_completed as IsEmergencyProcedureCompleted,
                        is_emergency_discharge_completed as IsEmergencyDischargeCompleted,
                        is_surgery_pre_op_completed as IsSurgeryPreOpCompleted,
                        is_surgery_details_completed as IsSurgeryDetailsCompleted,
                        is_surgery_post_op_completed as IsSurgeryPostOpCompleted,
                        is_surgery_discharge_completed as IsSurgeryDischargeCompleted,
                        is_deworming_intake_completed as IsDewormingIntakeCompleted,
                        is_deworming_medication_completed as IsDewormingMedicationCompleted,
                        is_deworming_notes_completed as IsDewormingNotesCompleted,
                        is_deworming_checkout_completed as IsDewormingCheckoutCompleted,
                        created_at as CreatedAt,
                        updated_at as UpdatedAt
                    FROM visits WHERE appointment_id = @AppointmentId";
                return await connection.QueryFirstOrDefaultAsync<Visit>(sql, new { AppointmentId = appointmentId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByAppointmentIdAsync");
                throw;
            }
        }

        public async Task<Visit?> GetByPatientIdAsync(Guid patientId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT 
                        id as Id,
                        appointment_id as AppointmentId,
                        patient_id as PatientId,
                        is_intake_completed as IsIntakeCompleted,
                        is_complaints_completed as IsComplaintsCompleted,
                        is_vitals_completed as IsVitalsCompleted,
                        is_plan_completed as IsPlanCompleted,
                        is_prescription_completed as IsPrescriptionCompleted,
                        is_procedure_completed as IsProceduresCompleted,
                        is_vaccination_detail_completed as IsVaccinationDetailCompleted,
                        is_emergency_triage_completed as IsEmergencyTriageCompleted,
                        is_emergency_vital_completed as IsEmergencyVitalCompleted,
                        is_emergency_procedure_completed as IsEmergencyProcedureCompleted,
                        is_emergency_discharge_completed as IsEmergencyDischargeCompleted,
                        is_surgery_pre_op_completed as IsSurgeryPreOpCompleted,
                        is_surgery_details_completed as IsSurgeryDetailsCompleted,
                        is_surgery_post_op_completed as IsSurgeryPostOpCompleted,
                        is_surgery_discharge_completed as IsSurgeryDischargeCompleted,
                        is_deworming_intake_completed as IsDewormingIntakeCompleted,
                        is_deworming_medication_completed as IsDewormingMedicationCompleted,
                        is_deworming_notes_completed as IsDewormingNotesCompleted,
                        is_deworming_checkout_completed as IsDewormingCheckoutCompleted,
                        created_at as CreatedAt,
                        updated_at as UpdatedAt
                    FROM visits WHERE patient_id = @PatientId";
                return await connection.QueryFirstOrDefaultAsync<Visit>(sql, new { PatientId = patientId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByPatientIdAsync");
                throw;
            }
        }
    }
} 