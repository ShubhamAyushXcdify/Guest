using System;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class SurgeryPreOpRepository : ISurgeryPreOpRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<SurgeryPreOpRepository> _logger;

        public SurgeryPreOpRepository(DapperDbContext dbContext, ILogger<SurgeryPreOpRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<SurgeryPreOp> CreateAsync(SurgeryPreOp preOp)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            preOp.Id = Guid.NewGuid();
            preOp.CreatedAt = DateTime.UtcNow;
            preOp.UpdatedAt = DateTime.UtcNow;
            const string query = @"
INSERT INTO surgery_pre_op 
(id, visit_id, weight_kg, pre_op_bloodwork_results, anesthesia_risk_assessment, fasting_status, pre_op_medications, notes, is_completed, created_at, updated_at)
VALUES 
(@Id, @VisitId, @WeightKg, @PreOpBloodworkResults, @AnesthesiaRiskAssessment, @FastingStatus, @PreOpMedications, @Notes, @IsCompleted, @CreatedAt, @UpdatedAt)
RETURNING 
    id, visit_id, weight_kg, pre_op_bloodwork_results, anesthesia_risk_assessment, fasting_status, pre_op_medications, notes, is_completed, created_at, updated_at;";
            return await connection.QuerySingleAsync<SurgeryPreOp>(query, preOp);
        }

        public async Task<SurgeryPreOp?> GetByIdAsync(Guid id)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            const string query = @"SELECT id, visit_id, weight_kg, pre_op_bloodwork_results, anesthesia_risk_assessment, fasting_status, pre_op_medications, notes, is_completed, created_at, updated_at FROM surgery_pre_op WHERE id = @Id;";
            return await connection.QuerySingleOrDefaultAsync<SurgeryPreOp>(query, new { Id = id });
        }

        public async Task<SurgeryPreOp?> GetByVisitIdAsync(Guid visitId)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            const string query = @"SELECT id, visit_id, weight_kg, pre_op_bloodwork_results, anesthesia_risk_assessment, fasting_status, pre_op_medications, notes, is_completed, created_at, updated_at FROM surgery_pre_op WHERE visit_id = @VisitId;";
            return await connection.QuerySingleOrDefaultAsync<SurgeryPreOp>(query, new { VisitId = visitId });
        }

        public async Task<SurgeryPreOp> UpdateAsync(SurgeryPreOp preOp)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            preOp.UpdatedAt = DateTime.UtcNow;
            const string query = @"
UPDATE surgery_pre_op SET
    weight_kg = @WeightKg,
    pre_op_bloodwork_results = @PreOpBloodworkResults,
    anesthesia_risk_assessment = @AnesthesiaRiskAssessment,
    fasting_status = @FastingStatus,
    pre_op_medications = @PreOpMedications,
    notes = @Notes,
    is_completed = @IsCompleted,
    updated_at = @UpdatedAt
WHERE id = @Id
RETURNING id, visit_id, weight_kg, pre_op_bloodwork_results, anesthesia_risk_assessment, fasting_status, pre_op_medications, notes, is_completed, created_at, updated_at;";
            return await connection.QuerySingleOrDefaultAsync<SurgeryPreOp>(query, preOp);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            const string query = @"DELETE FROM surgery_pre_op WHERE id = @Id;";
            var affected = await connection.ExecuteAsync(query, new { Id = id });
            return affected > 0;
        }
    }
} 