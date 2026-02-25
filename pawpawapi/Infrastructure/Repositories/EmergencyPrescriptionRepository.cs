using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;

namespace Infrastructure.Repositories
{
    public class EmergencyPrescriptionRepository : IEmergencyPrescriptionRepository
    {
        private readonly DapperDbContext _context;

        public EmergencyPrescriptionRepository(DapperDbContext context)
        {
            _context = context;
        }

        public async Task<EmergencyPrescription?> GetByIdAsync(Guid id)
        {
            const string sql = "SELECT * FROM emergency_prescription WHERE id = @Id";
            using var conn = await _context.CreateConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<EmergencyPrescription>(sql, new { Id = id });
        }

        public async Task<IEnumerable<EmergencyPrescription>> GetAllAsync()
        {
            const string sql = "SELECT * FROM emergency_prescription ORDER BY created_at DESC";
            using var conn = await _context.CreateConnectionAsync();
            return await conn.QueryAsync<EmergencyPrescription>(sql);
        }

        public async Task<IEnumerable<EmergencyPrescription>> GetByVisitIdAsync(Guid visitId)
        {
            const string sql = "SELECT * FROM emergency_prescription WHERE visit_id = @VisitId ORDER BY created_at DESC";
            using var conn = await _context.CreateConnectionAsync();
            return await conn.QueryAsync<EmergencyPrescription>(sql, new { VisitId = visitId });
        }

        public async Task<IEnumerable<EmergencyPrescription>> GetByDischargeIdAsync(Guid dischargeId)
        {
            const string sql = "SELECT * FROM emergency_prescription WHERE emergency_discharge_id = @DischargeId ORDER BY created_at DESC";
            using var conn = await _context.CreateConnectionAsync();
            return await conn.QueryAsync<EmergencyPrescription>(sql, new { DischargeId = dischargeId });
        }

        public async Task AddAsync(EmergencyPrescription prescription)
        {
            const string sql = @"INSERT INTO emergency_prescription (
                id, emergency_discharge_id, visit_id, medication_name, dose, frequency, duration, is_completed, created_at, updated_at
            ) VALUES (
                @Id, @EmergencyDischargeId, @VisitId, @MedicationName, @Dose, @Frequency, @Duration, @IsCompleted, @CreatedAt, @UpdatedAt
            )";
            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync(sql, prescription);
        }

        public async Task UpdateAsync(EmergencyPrescription prescription)
        {
            const string sql = @"UPDATE emergency_prescription SET
                emergency_discharge_id = @EmergencyDischargeId,
                visit_id = @VisitId,
                medication_name = @MedicationName,
                dose = @Dose,
                frequency = @Frequency,
                duration = @Duration,
                is_completed = @IsCompleted,
                updated_at = @UpdatedAt
            WHERE id = @Id";
            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync(sql, prescription);
        }

        public async Task DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM emergency_prescription WHERE id = @Id";
            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync(sql, new { Id = id });
        }
    }
} 