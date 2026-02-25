using System;
using System.Data;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;

namespace Infrastructure.Repositories
{
    public class SurgeryPostOpRepository : ISurgeryPostOpRepository
    {
        private readonly DapperDbContext _dbContext;

        public SurgeryPostOpRepository(DapperDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<SurgeryPostOp> GetByIdAsync(Guid id)
        {
            using var db = await _dbContext.CreateConnectionAsync();
            const string sql = "SELECT * FROM surgery_post_op WHERE id = @Id";
            return await db.QueryFirstOrDefaultAsync<SurgeryPostOp>(sql, new { Id = id });
        }

        public async Task<SurgeryPostOp> GetByVisitIdAsync(Guid visitId)
        {
            using var db = await _dbContext.CreateConnectionAsync();
            const string sql = "SELECT * FROM surgery_post_op WHERE visit_id = @VisitId";
            return await db.QueryFirstOrDefaultAsync<SurgeryPostOp>(sql, new { VisitId = visitId });
        }

        public async Task<Guid> CreateAsync(SurgeryPostOp postOp)
        {
            using var db = await _dbContext.CreateConnectionAsync();
            const string sql = @"INSERT INTO surgery_post_op (
                id, visit_id, recovery_status, pain_assessment, vital_signs, post_op_medications, wound_care, notes, is_completed, created_at, updated_at
            ) VALUES (
                @Id, @VisitId, @RecoveryStatus, @PainAssessment, @VitalSigns, @PostOpMedications, @WoundCare, @Notes, @IsCompleted, @CreatedAt, @UpdatedAt
            ) RETURNING id;";
            return await db.ExecuteScalarAsync<Guid>(sql, postOp);
        }

        public async Task<bool> UpdateAsync(SurgeryPostOp postOp)
        {
            using var db = await _dbContext.CreateConnectionAsync();
            const string sql = @"UPDATE surgery_post_op SET
                visit_id = @VisitId,
                recovery_status = @RecoveryStatus,
                pain_assessment = @PainAssessment,
                vital_signs = @VitalSigns,
                post_op_medications = @PostOpMedications,
                wound_care = @WoundCare,
                notes = @Notes,
                is_completed = @IsCompleted,
                updated_at = @UpdatedAt
            WHERE id = @Id";
            var rows = await db.ExecuteAsync(sql, postOp);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var db = await _dbContext.CreateConnectionAsync();
            const string sql = "DELETE FROM surgery_post_op WHERE id = @Id";
            var rows = await db.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }
    }
} 