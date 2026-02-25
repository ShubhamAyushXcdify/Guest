using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class EmergencyProcedureRepository : IEmergencyProcedureRepository
    {
        private readonly DapperDbContext _context;
        private readonly ILogger<EmergencyProcedureRepository> _logger;

        public EmergencyProcedureRepository(DapperDbContext context, ILogger<EmergencyProcedureRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<EmergencyProcedure?> GetByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                const string sql = "SELECT * FROM emergency_procedures WHERE id = @Id";
                using var conn = await _context.CreateConnectionAsync();
                var procedure = await conn.QueryFirstOrDefaultAsync<EmergencyProcedure>(sql, new { Id = id });
                return procedure;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for emergency procedure {Id}", id);
                throw new InvalidOperationException($"Failed to retrieve emergency procedure with id {id}.", ex);
            }
        }

        public async Task<IEnumerable<EmergencyProcedure>> GetAllAsync()
        {
            try
            {
                const string sql = "SELECT * FROM emergency_procedures ORDER BY created_at DESC";
                using var conn = await _context.CreateConnectionAsync();
                var procedures = (await conn.QueryAsync<EmergencyProcedure>(sql)).AsList();
                return procedures;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync for emergency procedures");
                throw new InvalidOperationException("Failed to retrieve emergency procedures.", ex);
            }
        }

        public async Task<IEnumerable<EmergencyProcedure>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    throw new ArgumentException("VisitId cannot be empty.", nameof(visitId));

                const string sql = "SELECT * FROM emergency_procedures WHERE visit_id = @VisitId ORDER BY created_at DESC";
                using var conn = await _context.CreateConnectionAsync();
                var procedures = (await conn.QueryAsync<EmergencyProcedure>(sql, new { VisitId = visitId })).AsList();
                return procedures;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visitId {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to retrieve emergency procedures for visit {visitId}.", ex);
            }
        }

        public async Task AddAsync(EmergencyProcedure procedure)
        {
            const string sql = @"INSERT INTO emergency_procedures (
                id, visit_id, procedure_time, iv_catheter_placement, oxygen_therapy, cpr, wound_care, bandaging, defibrillation, blood_transfusion, intubation, other_procedure, other_procedure_performed, performed_by, fluids_type, fluids_volume_ml, fluids_rate_ml_hr, response_to_treatment, notes, is_completed, created_at, updated_at
            ) VALUES (
                @Id, @VisitId, @ProcedureTime, @IvCatheterPlacement, @OxygenTherapy, @Cpr, @WoundCare, @Bandaging, @Defibrillation, @BloodTransfusion, @Intubation, @OtherProcedure, @OtherProcedurePerformed, @PerformedBy, @FluidsType, @FluidsVolumeMl, @FluidsRateMlHr, @ResponseToTreatment, @Notes, @IsCompleted, @CreatedAt, @UpdatedAt
            )";
            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync(sql, procedure);
            
        }

        public async Task UpdateAsync(EmergencyProcedure procedure)
        {
            const string sql = @"UPDATE emergency_procedures SET
                visit_id = @VisitId,
                procedure_time = @ProcedureTime,
                iv_catheter_placement = @IvCatheterPlacement,
                oxygen_therapy = @OxygenTherapy,
                cpr = @Cpr,
                wound_care = @WoundCare,
                bandaging = @Bandaging,
                defibrillation = @Defibrillation,
                blood_transfusion = @BloodTransfusion,
                intubation = @Intubation,
                other_procedure = @OtherProcedure,
                other_procedure_performed = @OtherProcedurePerformed,
                performed_by = @PerformedBy,
                fluids_type = @FluidsType,
                fluids_volume_ml = @FluidsVolumeMl,
                fluids_rate_ml_hr = @FluidsRateMlHr,
                response_to_treatment = @ResponseToTreatment,
                notes = @Notes,
                is_completed = @IsCompleted,
                updated_at = @UpdatedAt
            WHERE id = @Id";
            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync(sql, procedure);
            // Remove existing medications and re-insert
            const string delSql = "DELETE FROM emergency_procedure_medications WHERE emergency_procedure_id = @ProcedureId";
            await conn.ExecuteAsync(delSql, new { ProcedureId = procedure.Id });
        }

        public async Task DeleteAsync(Guid id)
        {
            using var conn = await _context.CreateConnectionAsync();
            const string delMedSql = "DELETE FROM emergency_procedure_medications WHERE emergency_procedure_id = @ProcedureId";
            await conn.ExecuteAsync(delMedSql, new { ProcedureId = id });
            const string sql = "DELETE FROM emergency_procedures WHERE id = @Id";
            await conn.ExecuteAsync(sql, new { Id = id });
        }

    }
} 