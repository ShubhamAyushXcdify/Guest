using System;
using System.Data;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;

namespace Infrastructure.Repositories
{
    public class SurgeryDischargeRepository : ISurgeryDischargeRepository
    {
        private readonly Infrastructure.Data.DapperDbContext _dbContext;

        public SurgeryDischargeRepository(Infrastructure.Data.DapperDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<SurgeryDischarge> GetByIdAsync(Guid id)
        {
            using var db = await _dbContext.CreateConnectionAsync();
            const string sql = "SELECT * FROM surgery_discharge WHERE id = @Id";
            return await db.QueryFirstOrDefaultAsync<SurgeryDischarge>(sql, new { Id = id });
        }

        public async Task<SurgeryDischarge> GetByVisitIdAsync(Guid visitId)
        {
            using var db = await _dbContext.CreateConnectionAsync();
            const string sql = "SELECT * FROM surgery_discharge WHERE visit_id = @VisitId";
            return await db.QueryFirstOrDefaultAsync<SurgeryDischarge>(sql, new { VisitId = visitId });
        }

        public async Task<Guid> CreateAsync(SurgeryDischarge discharge)
        {
            using var db = await _dbContext.CreateConnectionAsync();
            const string sql = @"INSERT INTO surgery_discharge (
                id, visit_id, discharge_status, discharge_datetime, home_care_instructions, medications_to_go_home, follow_up_instructions, followup_date, is_completed, created_at, updated_at
            ) VALUES (
                @Id, @VisitId, @DischargeStatus, @DischargeDatetime, @HomeCareInstructions, @MedicationsToGoHome, @FollowUpInstructions, @FollowupDate, @IsCompleted, @CreatedAt, @UpdatedAt
            ) RETURNING id;";
            return await db.ExecuteScalarAsync<Guid>(sql, discharge);
        }

        public async Task<bool> UpdateAsync(SurgeryDischarge discharge)
        {
            using var db = await _dbContext.CreateConnectionAsync();
            const string sql = @"UPDATE surgery_discharge SET
                visit_id = @VisitId,
                discharge_status = @DischargeStatus,
                discharge_datetime = @DischargeDatetime,
                home_care_instructions = @HomeCareInstructions,
                medications_to_go_home = @MedicationsToGoHome,
                follow_up_instructions = @FollowUpInstructions,
                followup_date = @FollowupDate,
                is_completed = @IsCompleted,
                updated_at = @UpdatedAt
            WHERE id = @Id";
            var rows = await db.ExecuteAsync(sql, discharge);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var db = await _dbContext.CreateConnectionAsync();
            const string sql = "DELETE FROM surgery_discharge WHERE id = @Id";
            var rows = await db.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }
    }
} 