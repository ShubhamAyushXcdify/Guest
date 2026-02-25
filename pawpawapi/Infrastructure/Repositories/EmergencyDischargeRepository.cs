using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;

namespace Infrastructure.Repositories
{
    public class EmergencyDischargeRepository : IEmergencyDischargeRepository
    {
        private readonly DapperDbContext _context;

        public EmergencyDischargeRepository(DapperDbContext context)
        {
            _context = context;
        }

        public async Task<EmergencyDischarge?> GetByIdAsync(Guid id)
        {
            const string sql = "SELECT * FROM emergency_discharge WHERE id = @Id";
            using var conn = await _context.CreateConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<EmergencyDischarge>(sql, new { Id = id });
        }

        public async Task<IEnumerable<EmergencyDischarge>> GetAllAsync()
        {
            const string sql = "SELECT * FROM emergency_discharge ORDER BY created_at DESC";
            using var conn = await _context.CreateConnectionAsync();
            return await conn.QueryAsync<EmergencyDischarge>(sql);
        }

        public async Task<IEnumerable<EmergencyDischarge>> GetByVisitIdAsync(Guid visitId)
        {
            const string sql = "SELECT * FROM emergency_discharge WHERE visit_id = @VisitId ORDER BY created_at DESC";
            using var conn = await _context.CreateConnectionAsync();
            return await conn.QueryAsync<EmergencyDischarge>(sql, new { VisitId = visitId });
        }


        public async Task AddAsync(EmergencyDischarge discharge)
        {
            const string sql = @"INSERT INTO emergency_discharge (
            id, visit_id, discharge_status, discharge_time, responsible_clinician, discharge_summary, 
            home_care_instructions, followup_instructions, followup_date, reviewed_with_client, is_completed, 
            created_at, updated_at
        ) VALUES (
            @Id, @VisitId, @DischargeStatus, @DischargeTime, @ResponsibleClinician, @DischargeSummary, 
            @HomeCareInstructions, @FollowupInstructions, @FollowupDate, @ReviewedWithClient, @IsCompleted, 
            @CreatedAt, @UpdatedAt
        )";


            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync(sql, discharge);
        }


        public async Task UpdateAsync(EmergencyDischarge discharge)
        {
            const string sql = @"UPDATE emergency_discharge SET
                visit_id = @VisitId,
                discharge_status = @DischargeStatus,
                discharge_time = @DischargeTime,
                responsible_clinician = @ResponsibleClinician,
                discharge_summary = @DischargeSummary,
                home_care_instructions = @HomeCareInstructions,
                followup_instructions = @FollowupInstructions,
                followup_date = @FollowupDate,
                reviewed_with_client = @ReviewedWithClient,
                is_completed = @IsCompleted,
                updated_at = @UpdatedAt
            WHERE id = @Id";
            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync(sql, discharge);
        }

        public async Task DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM emergency_discharge WHERE id = @Id";
            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync(sql, new { Id = id });
        }
    }
} 