using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class DewormingNoteRepository : IDewormingNoteRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<DewormingNoteRepository> _logger;

        public DewormingNoteRepository(DapperDbContext dbContext, ILogger<DewormingNoteRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<DewormingNote?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
SELECT 
    id AS Id,
    visit_id AS VisitId,
    adverse_reactions AS AdverseReactions,
    additional_notes AS AdditionalNotes,
    owner_concerns AS OwnerConcerns,
    resolution_status AS ResolutionStatus,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM deworming_notes WHERE id = @Id;";
                return await connection.QuerySingleOrDefaultAsync<DewormingNote>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for DewormingNote {NoteId}", id);
                throw new InvalidOperationException($"Failed to get DewormingNote with id {id}", ex);
            }
        }

        public async Task<IEnumerable<DewormingNote>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
SELECT 
    id AS Id,
    visit_id AS VisitId,
    adverse_reactions AS AdverseReactions,
    additional_notes AS AdditionalNotes,
    owner_concerns AS OwnerConcerns,
    resolution_status AS ResolutionStatus,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM deworming_notes WHERE visit_id = @VisitId;";
                return await connection.QueryAsync<DewormingNote>(sql, new { VisitId = visitId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for DewormingNote {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to get DewormingNotes for visit {visitId}", ex);
            }
        }

        public async Task<DewormingNote> CreateAsync(DewormingNote note)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                using var transaction = connection.BeginTransaction();
                try
                {
                    // Generate new ID if not provided
                    if (note.Id == Guid.Empty)
                    {
                        note.Id = Guid.NewGuid();
                    }

                    // Set timestamps
                    note.CreatedAt = DateTime.UtcNow;
                    note.UpdatedAt = DateTime.UtcNow;

                    const string sql = @"
INSERT INTO deworming_notes (
    id, visit_id, adverse_reactions, additional_notes, owner_concerns, resolution_status, is_completed, created_at, updated_at
) VALUES (
    @Id, @VisitId, @AdverseReactions, @AdditionalNotes, @OwnerConcerns, @ResolutionStatus, @IsCompleted, @CreatedAt, @UpdatedAt
) RETURNING 
    id AS Id,
    visit_id AS VisitId,
    adverse_reactions AS AdverseReactions,
    additional_notes AS AdditionalNotes,
    owner_concerns AS OwnerConcerns,
    resolution_status AS ResolutionStatus,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";
                    var created = await connection.QuerySingleAsync<DewormingNote>(sql, note, transaction);
                    transaction.Commit();
                    return created;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction for DewormingNote");
                    throw new InvalidOperationException("Failed to create DewormingNote", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync for DewormingNote");
                throw new InvalidOperationException("Failed to create DewormingNote", ex);
            }
        }

        public async Task<DewormingNote> UpdateAsync(DewormingNote note)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                using var transaction = connection.BeginTransaction();
                try
                {
                    // Set updated timestamp
                    note.UpdatedAt = DateTime.UtcNow;

                    const string sql = @"
UPDATE deworming_notes SET
    adverse_reactions = @AdverseReactions,
    additional_notes = @AdditionalNotes,
    owner_concerns = @OwnerConcerns,
    resolution_status = @ResolutionStatus,
    is_completed = @IsCompleted,
    updated_at = @UpdatedAt
WHERE id = @Id
RETURNING 
    id AS Id,
    visit_id AS VisitId,
    adverse_reactions AS AdverseReactions,
    additional_notes AS AdditionalNotes,
    owner_concerns AS OwnerConcerns,
    resolution_status AS ResolutionStatus,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";
                    var updated = await connection.QuerySingleAsync<DewormingNote>(sql, note, transaction);
                    transaction.Commit();
                    return updated;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for DewormingNote {NoteId}", note.Id);
                    throw new InvalidOperationException($"Failed to update DewormingNote with id {note.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for DewormingNote {NoteId}", note.Id);
                throw new InvalidOperationException($"Failed to update DewormingNote with id {note.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = "DELETE FROM deworming_notes WHERE id = @Id;";
                var rows = await connection.ExecuteAsync(sql, new { Id = id });
                return rows > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for DewormingNote {NoteId}", id);
                throw new InvalidOperationException($"Failed to delete DewormingNote with id {id}", ex);
            }
        }
    }
} 