using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace Infrastructure.Repositories
{
    public class PatientFileRepository : IPatientFileRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<PatientFileRepository> _logger;

        public PatientFileRepository(DapperDbContext dbContext, ILogger<PatientFileRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PatientFile> CreateAsync(PatientFile patientFile)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    patientFile.Id = Guid.NewGuid();
                    patientFile.CreatedAt = DateTimeOffset.UtcNow;
                    patientFile.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        patientFile.Id,
                        patientFile.PatientId,
                        patientFile.VisitId,
                        patientFile.Name,
                        patientFile.CreatedBy,
                        patientFile.CreatedAt,
                        patientFile.UpdatedAt
                    };

                    var query = @"
INSERT INTO patient_files 
(id, patient_id, visit_id, name, created_by, created_at, updated_at) 
VALUES 
(@Id, @PatientId, @VisitId, @Name, @CreatedBy, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    patient_id AS PatientId,
    visit_id AS VisitId,
    name AS Name,
    created_by AS CreatedBy,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var createdPatientFile = await connection.QuerySingleAsync<PatientFile>(query, parameters, transaction);
                    transaction.Commit();
                    return createdPatientFile;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create patient file", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create patient file", ex);
            }
        }

        public async Task<PatientFile?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pf.id,
    pf.patient_id,
    pf.visit_id,
    pf.name,
    pf.created_by,
    pf.created_at,
    pf.updated_at,
    u.first_name,
    u.last_name
FROM patient_files pf
LEFT JOIN users u ON pf.created_by = u.id
WHERE pf.id = @Id;";

                var result = await connection.QuerySingleOrDefaultAsync(query, new { Id = id });
                
                if (result == null)
                    return null;

                var dataDict = (IDictionary<string, object>)result;

                // Map to PatientFile
                var patientFile = new PatientFile
                {
                    Id = (Guid)dataDict["id"],
                    PatientId = (Guid)dataDict["patient_id"],
                    VisitId = dataDict["visit_id"] != DBNull.Value ? (Guid?)dataDict["visit_id"] : null,
                    Name = (dataDict["name"] as string) ?? string.Empty,
                    CreatedBy = (Guid)dataDict["created_by"],
                    CreatedAt = (DateTime)dataDict["created_at"],
                    UpdatedAt = (DateTime)dataDict["updated_at"]
                };

                // Set Creator if available
                if (dataDict["first_name"] != null)
                {
                    patientFile.Creator = new User 
                    { 
                        FirstName = (dataDict["first_name"] as string) ?? string.Empty,
                        LastName = (dataDict["last_name"] as string) ?? string.Empty
                    };
                }

                patientFile.Attachments = await GetAttachmentsByPatientFileIdAsync(id);
                return patientFile;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for patient file {PatientFileId}", id);
                throw new InvalidOperationException($"Failed to get patient file with id {id}", ex);
            }
        }

        public async Task<IEnumerable<PatientFile>> GetByPatientIdAsync(Guid patientId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pf.id,
    pf.patient_id,
    pf.visit_id,
    pf.name,
    pf.created_by,
    pf.created_at,
    pf.updated_at,
    u.first_name,
    u.last_name
FROM patient_files pf
LEFT JOIN users u ON pf.created_by = u.id
WHERE pf.patient_id = @PatientId
ORDER BY pf.created_at DESC;";

                var patientFiles = await connection.QueryAsync(query, new { PatientId = patientId });
                
                var results = new List<PatientFile>();
                foreach (var pf in patientFiles)
                {
                    var dataDict = (IDictionary<string, object>)pf;
                    
                    var result = new PatientFile
                    {
                        Id = (Guid)dataDict["id"],
                        PatientId = (Guid)dataDict["patient_id"],
                        VisitId = dataDict["visit_id"] != DBNull.Value ? (Guid?)dataDict["visit_id"] : null,
                        Name = (dataDict["name"] as string) ?? string.Empty,
                        CreatedBy = (Guid)dataDict["created_by"],
                        CreatedAt = (DateTime)dataDict["created_at"],
                        UpdatedAt = (DateTime)dataDict["updated_at"]
                    };

                    if (dataDict["first_name"] != null)
                    {
                        result.Creator = new User 
                        { 
                            FirstName = (dataDict["first_name"] as string) ?? string.Empty,
                            LastName = (dataDict["last_name"] as string) ?? string.Empty
                        };
                    }

                    results.Add(result);
                }

                // Load attachments for each patient file
                foreach (var result in results)
                {
                    result.Attachments = await GetAttachmentsByPatientFileIdAsync(result.Id);
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByPatientIdAsync for patient {PatientId}", patientId);
                throw new InvalidOperationException($"Failed to get patient files for patient {patientId}", ex);
            }
        }

        public async Task<PatientFile> UpdateAsync(PatientFile patientFile)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    patientFile.UpdatedAt = DateTimeOffset.UtcNow;

                    var query = @"
UPDATE patient_files
SET
    name = @Name,
    visit_id = @VisitId,
    updated_at = @UpdatedAt
WHERE id = @Id
RETURNING
    id AS Id,
    patient_id AS PatientId,
    visit_id AS VisitId,
    name AS Name,
    created_by AS CreatedBy,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var parameters = new
                    {
                        patientFile.Id,
                        patientFile.Name,
                        patientFile.VisitId,
                        patientFile.UpdatedAt
                    };

                    var updatedPatientFile = await connection.QuerySingleAsync<PatientFile>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedPatientFile;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for patient file {PatientFileId}", patientFile.Id);
                    throw new InvalidOperationException($"Failed to update patient file with id {patientFile.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for patient file {PatientFileId}", patientFile.Id);
                throw new InvalidOperationException($"Failed to update patient file with id {patientFile.Id}", ex);
            }
        }

        public async Task<IEnumerable<PatientFile>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pf.id,
    pf.patient_id,
    pf.visit_id,
    pf.name,
    pf.created_by,
    pf.created_at,
    pf.updated_at,
    u.first_name,
    u.last_name
FROM patient_files pf
LEFT JOIN users u ON pf.created_by = u.id
WHERE pf.visit_id = @VisitId
ORDER BY pf.created_at DESC;";

                var patientFiles = await connection.QueryAsync(query, new { VisitId = visitId });
                
                var results = new List<PatientFile>();
                foreach (var pf in patientFiles)
                {
                    var dataDict = (IDictionary<string, object>)pf;
                    
                    var result = new PatientFile
                    {
                        Id = (Guid)dataDict["id"],
                        PatientId = (Guid)dataDict["patient_id"],
                        VisitId = dataDict["visit_id"] != DBNull.Value ? (Guid?)dataDict["visit_id"] : null,
                        Name = (dataDict["name"] as string) ?? string.Empty,
                        CreatedBy = (Guid)dataDict["created_by"],
                        CreatedAt = (DateTime)dataDict["created_at"],
                        UpdatedAt = (DateTime)dataDict["updated_at"]
                    };

                    if (dataDict["first_name"] != null)
                    {
                        result.Creator = new User 
                        { 
                            FirstName = (dataDict["first_name"] as string) ?? string.Empty,
                            LastName = (dataDict["last_name"] as string) ?? string.Empty
                        };
                    }

                    results.Add(result);
                }

                // Load attachments for each patient file
                foreach (var result in results)
                {
                    result.Attachments = await GetAttachmentsByPatientFileIdAsync(result.Id);
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to get patient files for visit {visitId}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM patient_files WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for patient file {PatientFileId}", id);
                throw new InvalidOperationException($"Failed to delete patient file with id {id}", ex);
            }
        }

        public async Task<bool> DeleteByVisitIdAsync(Guid visitId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM patient_files WHERE visit_id = @VisitId;";
                var rowsAffected = await connection.ExecuteAsync(query, new { VisitId = visitId });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteByVisitIdAsync for visit {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to delete patient files for visit {visitId}", ex);
            }
        }

        public async Task<PatientFileAttachment> AddAttachmentAsync(PatientFileAttachment attachment)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                attachment.Id = Guid.NewGuid();
                attachment.CreatedAt = DateTimeOffset.UtcNow;
                attachment.UpdatedAt = DateTimeOffset.UtcNow;

                var query = @"
INSERT INTO patient_file_attachments 
(id, patient_file_id, file_name, file_path, file_type, file_size, created_at, updated_at) 
VALUES 
(@Id, @PatientFileId, @FileName, @FilePath, @FileType, @FileSize, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    patient_file_id AS PatientFileId,
    file_name AS FileName,
    file_path AS FilePath,
    file_type AS FileType,
    file_size AS FileSize,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                return await connection.QuerySingleAsync<PatientFileAttachment>(query, attachment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddAttachmentAsync for patient file {PatientFileId}", attachment.PatientFileId);
                throw new InvalidOperationException($"Failed to add attachment for patient file {attachment.PatientFileId}", ex);
            }
        }

        public async Task<ICollection<PatientFileAttachment>> GetAttachmentsByPatientFileIdAsync(Guid patientFileId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    patient_file_id AS PatientFileId,
    file_name AS FileName,
    file_path AS FilePath,
    file_type AS FileType,
    file_size AS FileSize,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM patient_file_attachments 
WHERE patient_file_id = @PatientFileId;";

                var attachments = await connection.QueryAsync<PatientFileAttachment>(query, new { PatientFileId = patientFileId });
                return attachments.AsList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAttachmentsByPatientFileIdAsync for patient file {PatientFileId}", patientFileId);
                throw new InvalidOperationException($"Failed to get attachments for patient file {patientFileId}", ex);
            }
        }

        public async Task<bool> RemoveAttachmentAsync(Guid attachmentId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM patient_file_attachments WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = attachmentId });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RemoveAttachmentAsync for attachment {AttachmentId}", attachmentId);
                throw new InvalidOperationException($"Failed to remove attachment with id {attachmentId}", ex);
            }
        }

        public async Task<PatientFileAttachment?> GetAttachmentByIdAsync(Guid attachmentId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    patient_file_id AS PatientFileId,
    file_name AS FileName,
    file_path AS FilePath,
    file_type AS FileType,
    file_size AS FileSize,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM patient_file_attachments 
WHERE id = @Id;";

                return await connection.QuerySingleOrDefaultAsync<PatientFileAttachment>(query, new { Id = attachmentId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAttachmentByIdAsync for attachment {AttachmentId}", attachmentId);
                throw new InvalidOperationException($"Failed to get attachment with id {attachmentId}", ex);
            }
        }
    }
}

