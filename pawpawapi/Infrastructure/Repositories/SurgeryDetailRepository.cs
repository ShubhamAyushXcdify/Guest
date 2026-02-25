using System;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class SurgeryDetailRepository : ISurgeryDetailRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<SurgeryDetailRepository> _logger;

        public SurgeryDetailRepository(DapperDbContext dbContext, ILogger<SurgeryDetailRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<SurgeryDetail> CreateAsync(SurgeryDetail detail)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            detail.Id = Guid.NewGuid();
            detail.CreatedAt = DateTime.UtcNow;
            detail.UpdatedAt = DateTime.UtcNow;
            const string query = @"
INSERT INTO surgery_detail 
(id, visit_id, surgery_type, surgeon, anesthesiologist, surgery_start_time, surgery_end_time, anesthesia_protocol, surgical_findings, complications, notes, is_completed, created_at, updated_at)
VALUES 
(@Id, @VisitId, @SurgeryType, @Surgeon, @Anesthesiologist, @SurgeryStartTime, @SurgeryEndTime, @AnesthesiaProtocol, @SurgicalFindings, @Complications, @Notes, @IsCompleted, @CreatedAt, @UpdatedAt)
RETURNING 
    id, visit_id, surgery_type, surgeon, anesthesiologist, surgery_start_time, surgery_end_time, anesthesia_protocol, surgical_findings, complications, notes, is_completed, created_at, updated_at;";
            return await connection.QuerySingleAsync<SurgeryDetail>(query, detail);
        }

        public async Task<SurgeryDetail?> GetByIdAsync(Guid id)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            const string query = @"SELECT id, visit_id, surgery_type, surgeon, anesthesiologist, surgery_start_time, surgery_end_time, anesthesia_protocol, surgical_findings, complications, notes, is_completed, created_at, updated_at FROM surgery_detail WHERE id = @Id;";
            return await connection.QuerySingleOrDefaultAsync<SurgeryDetail>(query, new { Id = id });
        }

        public async Task<SurgeryDetail?> GetByVisitIdAsync(Guid visitId)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            const string query = @"SELECT id, visit_id, surgery_type, surgeon, anesthesiologist, surgery_start_time, surgery_end_time, anesthesia_protocol, surgical_findings, complications, notes, is_completed, created_at, updated_at FROM surgery_detail WHERE visit_id = @VisitId;";
            return await connection.QuerySingleOrDefaultAsync<SurgeryDetail>(query, new { VisitId = visitId });
        }

        public async Task<SurgeryDetail> UpdateAsync(SurgeryDetail detail)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            detail.UpdatedAt = DateTime.UtcNow;
            const string query = @"
UPDATE surgery_detail SET
    surgery_type = @SurgeryType,
    surgeon = @Surgeon,
    anesthesiologist = @Anesthesiologist,
    surgery_start_time = @SurgeryStartTime,
    surgery_end_time = @SurgeryEndTime,
    anesthesia_protocol = @AnesthesiaProtocol,
    surgical_findings = @SurgicalFindings,
    complications = @Complications,
    notes = @Notes,
    is_completed = @IsCompleted,
    updated_at = @UpdatedAt
WHERE id = @Id
RETURNING id, visit_id, surgery_type, surgeon, anesthesiologist, surgery_start_time, surgery_end_time, anesthesia_protocol, surgical_findings, complications, notes, is_completed, created_at, updated_at;";
            return await connection.QuerySingleAsync<SurgeryDetail>(query, detail);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = await _dbContext.CreateConnectionAsync();
            const string query = @"DELETE FROM surgery_detail WHERE id = @Id;";
            var affected = await connection.ExecuteAsync(query, new { Id = id });
            return affected > 0;
        }
    }
} 