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
    public class EmergencyVitalRepository : IEmergencyVitalRepository
    {
        private readonly DapperDbContext _context;
        private readonly ILogger<EmergencyVitalRepository> _logger;

        public EmergencyVitalRepository(DapperDbContext context, ILogger<EmergencyVitalRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<EmergencyVital?> GetByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                const string sql = "SELECT * FROM emergency_vitals WHERE id = @Id";
                using var conn = await _context.CreateConnectionAsync();
                return await conn.QueryFirstOrDefaultAsync<EmergencyVital>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for emergency vital {Id}", id);
                throw new InvalidOperationException($"Failed to retrieve emergency vital with id {id}.", ex);
            }
        }

        public async Task<IEnumerable<EmergencyVital>> GetAllAsync()
        {
            try
            {
                const string sql = "SELECT * FROM emergency_vitals ORDER BY created_at DESC";
                using var conn = await _context.CreateConnectionAsync();
                return await conn.QueryAsync<EmergencyVital>(sql);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync for emergency vitals");
                throw new InvalidOperationException("Failed to retrieve emergency vitals.", ex);
            }
        }

        public async Task<IEnumerable<EmergencyVital>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    throw new ArgumentException("VisitId cannot be empty.", nameof(visitId));

                const string sql = "SELECT * FROM emergency_vitals WHERE visit_id = @VisitId ORDER BY created_at DESC";
                using var conn = await _context.CreateConnectionAsync();
                return await conn.QueryAsync<EmergencyVital>(sql, new { VisitId = visitId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visitId {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to retrieve emergency vitals for visit {visitId}.", ex);
            }
        }

        public async Task AddAsync(EmergencyVital vital)
        {
            using var conn = await _context.CreateConnectionAsync();
            using var transaction = conn.BeginTransaction();
            try
            {
                if (vital == null)
                    throw new ArgumentNullException(nameof(vital));

                if (vital.Id == Guid.Empty)
                    throw new ArgumentException("Emergency vital Id cannot be empty.", nameof(vital));

                const string sql = @"INSERT INTO emergency_vitals (
                    id, visit_id, weight_kg, capillary_refill_time_sec, mucous_membrane_color, oxygen_saturation_spo2, blood_glucose_mg_dl, temperature_c, heart_rhythm, heart_rate_bpm, respiratory_rate_bpm, blood_pressure, supplemental_oxygen_given, notes, is_completed, created_at, updated_at
                ) VALUES (
                    @Id, @VisitId, @WeightKg, @CapillaryRefillTimeSec, @MucousMembraneColor, @OxygenSaturationSpo2, @BloodGlucoseMgDl, @TemperatureC, @HeartRhythm, @HeartRateBpm, @RespiratoryRateBpm, @BloodPressure, @SupplementalOxygenGiven, @Notes, @IsCompleted, @CreatedAt, @UpdatedAt
                )";

                await conn.ExecuteAsync(sql, vital, transaction);
                transaction.Commit();
                _logger.LogInformation("Emergency vital {Id} created successfully", vital.Id);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in AddAsync for emergency vital");
                throw new InvalidOperationException("Failed to create emergency vital.", ex);
            }
        }

        public async Task UpdateAsync(EmergencyVital vital)
        {
            using var conn = await _context.CreateConnectionAsync();
            using var transaction = conn.BeginTransaction();
            try
            {
                if (vital == null)
                    throw new ArgumentNullException(nameof(vital));

                if (vital.Id == Guid.Empty)
                    throw new ArgumentException("Emergency vital Id cannot be empty.", nameof(vital));

                const string sql = @"UPDATE emergency_vitals SET
                    visit_id = @VisitId,
                    weight_kg = @WeightKg,
                    capillary_refill_time_sec = @CapillaryRefillTimeSec,
                    mucous_membrane_color = @MucousMembraneColor,
                    oxygen_saturation_spo2 = @OxygenSaturationSpo2,
                    blood_glucose_mg_dl = @BloodGlucoseMgDl,
                    temperature_c = @TemperatureC,
                    heart_rhythm = @HeartRhythm,
                    heart_rate_bpm = @HeartRateBpm,
                    respiratory_rate_bpm = @RespiratoryRateBpm,
                    blood_pressure = @BloodPressure,
                    supplemental_oxygen_given = @SupplementalOxygenGiven,
                    notes = @Notes,
                    is_completed = @IsCompleted,
                    updated_at = @UpdatedAt
                WHERE id = @Id";

                var rowsAffected = await conn.ExecuteAsync(sql, vital, transaction);
                if (rowsAffected == 0)
                    throw new InvalidOperationException($"Emergency vital with id {vital.Id} not found for update.");

                transaction.Commit();
                _logger.LogInformation("Emergency vital {Id} updated successfully", vital.Id);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for emergency vital {Id}", vital?.Id);
                throw new InvalidOperationException($"Failed to update emergency vital with id {vital?.Id}.", ex);
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            using var conn = await _context.CreateConnectionAsync();
            using var transaction = conn.BeginTransaction();
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                const string sql = "DELETE FROM emergency_vitals WHERE id = @Id";
                var rowsAffected = await conn.ExecuteAsync(sql, new { Id = id }, transaction);

                if (rowsAffected == 0)
                    throw new InvalidOperationException($"Emergency vital with id {id} not found for deletion.");

                transaction.Commit();
                _logger.LogInformation("Emergency vital {Id} deleted successfully", id);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in DeleteAsync for emergency vital {Id}", id);
                throw new InvalidOperationException($"Failed to delete emergency vital with id {id}.", ex);
            }
        }
    }
} 