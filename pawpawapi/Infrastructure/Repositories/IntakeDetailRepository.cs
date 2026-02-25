using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Linq;

namespace Infrastructure.Repositories
{
    public class IntakeDetailRepository : IIntakeDetailRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<IntakeDetailRepository> _logger;

        public IntakeDetailRepository(DapperDbContext dbContext, ILogger<IntakeDetailRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IntakeDetail> CreateAsync(IntakeDetail intakeDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    intakeDetail.Id = Guid.NewGuid();
                    intakeDetail.CreatedAt = DateTimeOffset.UtcNow;
                    intakeDetail.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        intakeDetail.Id,
                        intakeDetail.VisitId,
                        intakeDetail.WeightKg,
                        intakeDetail.Notes,
                        intakeDetail.IsCompleted,
                        intakeDetail.CreatedAt,
                        intakeDetail.UpdatedAt
                    };

                    var query = @"
INSERT INTO intake_details 
(id, visit_id, weight_kg, notes, is_completed, created_at, updated_at) 
VALUES 
(@Id, @VisitId, @WeightKg, @Notes, @IsCompleted, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    visit_id AS VisitId,
    weight_kg AS WeightKg,
    notes AS Notes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var createdIntakeDetail = await connection.QuerySingleAsync<IntakeDetail>(query, parameters, transaction);
                    transaction.Commit();
                    return createdIntakeDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create intake detail", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create intake detail", ex);
            }
        }

        public async Task<IntakeDetail> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    visit_id AS VisitId,
    weight_kg AS WeightKg,
    notes AS Notes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM intake_details 
WHERE id = @Id;";

                var intakeDetail = await connection.QuerySingleOrDefaultAsync<IntakeDetail>(query, new { Id = id });
                if (intakeDetail != null)
                {
                    intakeDetail.Files = await GetFilesByIntakeDetailIdAsync(id);
                }
                return intakeDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for intake detail {IntakeDetailId}", id);
                throw new InvalidOperationException($"Failed to get intake detail with id {id}", ex);
            }
        }

        public async Task<IntakeDetail> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    visit_id AS VisitId,
    weight_kg AS WeightKg,
    notes AS Notes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM intake_details 
WHERE visit_id = @VisitId
ORDER BY created_at DESC;";

                var intakeDetails = await connection.QueryAsync<IntakeDetail>(query, new { VisitId = visitId });
                var intakeDetail = intakeDetails.FirstOrDefault();
                
                if (intakeDetail != null)
                {
                    intakeDetail.Files = await GetFilesByIntakeDetailIdAsync(intakeDetail.Id);
                }
                return intakeDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to get intake detail for visit {visitId}", ex);
            }
        }

        public async Task<IntakeDetail> UpdateAsync(IntakeDetail intakeDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    intakeDetail.UpdatedAt = DateTimeOffset.UtcNow;

                    // Simplified update query - always update all fields for consistency
                    var query = @"
UPDATE intake_details
SET
    weight_kg = @WeightKg,
    notes = @Notes,
    is_completed = @IsCompleted,
    updated_at = @UpdatedAt
WHERE id = @Id
RETURNING
    id AS Id,
    visit_id AS VisitId,
    weight_kg AS WeightKg,
    notes AS Notes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var parameters = new
                    {
                        intakeDetail.Id,
                        intakeDetail.WeightKg,
                        intakeDetail.Notes,
                        intakeDetail.IsCompleted,
                        intakeDetail.UpdatedAt
                    };

                    var updatedIntakeDetail = await connection.QuerySingleAsync<IntakeDetail>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedIntakeDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for intake detail {IntakeDetailId}", intakeDetail.Id);
                    throw new InvalidOperationException($"Failed to update intake detail with id {intakeDetail.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for intake detail {IntakeDetailId}", intakeDetail.Id);
                throw new InvalidOperationException($"Failed to update intake detail with id {intakeDetail.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM intake_details WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for intake detail {IntakeDetailId}", id);
                throw new InvalidOperationException($"Failed to delete intake detail with id {id}", ex);
            }
        }

        public async Task<IntakeFile> AddFileAsync(IntakeFile file)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                file.Id = Guid.NewGuid();
                file.CreatedAt = DateTimeOffset.UtcNow;
                file.UpdatedAt = DateTimeOffset.UtcNow;

                var query = @"
INSERT INTO intake_files 
(id, intake_detail_id, file_name, file_path, file_type, file_size, created_at, updated_at) 
VALUES 
(@Id, @IntakeDetailId, @FileName, @FilePath, @FileType, @FileSize, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    intake_detail_id AS IntakeDetailId,
    file_name AS FileName,
    file_path AS FilePath,
    file_type AS FileType,
    file_size AS FileSize,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                return await connection.QuerySingleAsync<IntakeFile>(query, file);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddFileAsync for intake detail {IntakeDetailId}", file.IntakeDetailId);
                throw new InvalidOperationException($"Failed to add file for intake detail {file.IntakeDetailId}", ex);
            }
        }

        public async Task<ICollection<IntakeFile>> GetFilesByIntakeDetailIdAsync(Guid intakeDetailId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    intake_detail_id AS IntakeDetailId,
    file_name AS FileName,
    file_path AS FilePath,
    file_type AS FileType,
    file_size AS FileSize,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM intake_files 
WHERE intake_detail_id = @IntakeDetailId;";

                var files = await connection.QueryAsync<IntakeFile>(query, new { IntakeDetailId = intakeDetailId });
                return files.AsList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetFilesByIntakeDetailIdAsync for intake detail {IntakeDetailId}", intakeDetailId);
                throw new InvalidOperationException($"Failed to get files for intake detail {intakeDetailId}", ex);
            }
        }

        public async Task<bool> RemoveFileAsync(Guid fileId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM intake_files WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = fileId });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RemoveFileAsync for file {FileId}", fileId);
                throw new InvalidOperationException($"Failed to remove file with id {fileId}", ex);
            }
        }

        public async Task<IntakeFile?> GetFileByIdAsync(Guid fileId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    intake_detail_id AS IntakeDetailId,
    file_name AS FileName,
    file_path AS FilePath,
    file_type AS FileType,
    file_size AS FileSize,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM intake_files 
WHERE id = @Id;";

                return await connection.QuerySingleOrDefaultAsync<IntakeFile>(query, new { Id = fileId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetFileByIdAsync for file {FileId}", fileId);
                throw new InvalidOperationException($"Failed to get file with id {fileId}", ex);
            }
        }
    }
} 