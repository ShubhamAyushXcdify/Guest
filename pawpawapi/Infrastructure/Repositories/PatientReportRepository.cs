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
    public class PatientReportRepository : IPatientReportRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<PatientReportRepository> _logger;

        public PatientReportRepository(DapperDbContext dbContext, ILogger<PatientReportRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PatientReport> CreateAsync(PatientReport patientReport)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    patientReport.Id = Guid.NewGuid();
                    patientReport.CreatedAt = DateTimeOffset.UtcNow;
                    patientReport.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        patientReport.Id,
                        patientReport.PatientId,
                        patientReport.DoctorId,
                        patientReport.CreatedById,
                        patientReport.HtmlFile,
                        patientReport.CreatedAt,
                        patientReport.UpdatedAt
                    };

                    var query = @"
INSERT INTO patient_reports 
(id, patient_id, doctor_id, created_by_id, html_file, created_at, updated_at) 
VALUES 
(@Id, @PatientId, @DoctorId, @CreatedById, @HtmlFile, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    patient_id AS PatientId,
    doctor_id AS DoctorId,
    created_by_id AS CreatedById,
    html_file AS HtmlFile,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var createdReport = await connection.QuerySingleAsync<PatientReport>(query, parameters, transaction);
                    transaction.Commit();
                    return createdReport;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create patient report", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create patient report", ex);
            }
        }

        public async Task<PatientReport?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pr.id,
    pr.patient_id,
    pr.doctor_id,
    pr.created_by_id,
    pr.html_file,
    pr.created_at,
    pr.updated_at,
    d.first_name AS doctor_first_name,
    d.last_name AS doctor_last_name,
    c.first_name AS creator_first_name,
    c.last_name AS creator_last_name
FROM patient_reports pr
LEFT JOIN users d ON pr.doctor_id = d.id
LEFT JOIN users c ON pr.created_by_id = c.id
WHERE pr.id = @Id;";

                var result = await connection.QuerySingleOrDefaultAsync(query, new { Id = id });
                
                if (result == null)
                    return null;

                var dataDict = (IDictionary<string, object>)result;

                // Map to PatientReport
                var patientReport = new PatientReport
                {
                    Id = (Guid)dataDict["id"],
                    PatientId = (Guid)dataDict["patient_id"],
                    DoctorId = (Guid)dataDict["doctor_id"],
                    CreatedById = (Guid)dataDict["created_by_id"],
                    HtmlFile = (dataDict["html_file"] as string) ?? string.Empty,
                    CreatedAt = (DateTimeOffset)dataDict["created_at"],
                    UpdatedAt = (DateTimeOffset)dataDict["updated_at"]
                };

                // Set Doctor if available
                if (dataDict["doctor_first_name"] != null)
                {
                    patientReport.Doctor = new User 
                    { 
                        FirstName = (dataDict["doctor_first_name"] as string) ?? string.Empty,
                        LastName = (dataDict["doctor_last_name"] as string) ?? string.Empty
                    };
                }

                // Set Creator if available
                if (dataDict["creator_first_name"] != null)
                {
                    patientReport.Creator = new User 
                    { 
                        FirstName = (dataDict["creator_first_name"] as string) ?? string.Empty,
                        LastName = (dataDict["creator_last_name"] as string) ?? string.Empty
                    };
                }

                return patientReport;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for patient report {ReportId}", id);
                throw new InvalidOperationException($"Failed to get patient report with id {id}", ex);
            }
        }

        public async Task<IEnumerable<PatientReport>> GetByPatientIdAsync(Guid patientId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pr.id,
    pr.patient_id,
    pr.doctor_id,
    pr.created_by_id,
    pr.html_file,
    pr.created_at,
    pr.updated_at,
    d.first_name AS doctor_first_name,
    d.last_name AS doctor_last_name,
    c.first_name AS creator_first_name,
    c.last_name AS creator_last_name
FROM patient_reports pr
LEFT JOIN users d ON pr.doctor_id = d.id
LEFT JOIN users c ON pr.created_by_id = c.id
WHERE pr.patient_id = @PatientId
ORDER BY pr.created_at DESC;";

                var reports = await connection.QueryAsync(query, new { PatientId = patientId });
                
                var results = new List<PatientReport>();
                foreach (var report in reports)
                {
                    var dataDict = (IDictionary<string, object>)report;
                    
                    var result = new PatientReport
                    {
                        Id = (Guid)dataDict["id"],
                        PatientId = (Guid)dataDict["patient_id"],
                        DoctorId = (Guid)dataDict["doctor_id"],
                        CreatedById = (Guid)dataDict["created_by_id"],
                        HtmlFile = (dataDict["html_file"] as string) ?? string.Empty,
                        CreatedAt = (DateTimeOffset)dataDict["created_at"],
                        UpdatedAt = (DateTimeOffset)dataDict["updated_at"]
                    };

                    if (dataDict["doctor_first_name"] != null)
                    {
                        result.Doctor = new User 
                        { 
                            FirstName = (dataDict["doctor_first_name"] as string) ?? string.Empty,
                            LastName = (dataDict["doctor_last_name"] as string) ?? string.Empty
                        };
                    }

                    if (dataDict["creator_first_name"] != null)
                    {
                        result.Creator = new User 
                        { 
                            FirstName = (dataDict["creator_first_name"] as string) ?? string.Empty,
                            LastName = (dataDict["creator_last_name"] as string) ?? string.Empty
                        };
                    }

                    results.Add(result);
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByPatientIdAsync for patient {PatientId}", patientId);
                throw new InvalidOperationException($"Failed to get patient reports for patient {patientId}", ex);
            }
        }

        public async Task<IEnumerable<PatientReport>> GetByDoctorIdAsync(Guid doctorId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pr.id,
    pr.patient_id,
    pr.doctor_id,
    pr.created_by_id,
    pr.html_file,
    pr.created_at,
    pr.updated_at,
    d.first_name AS doctor_first_name,
    d.last_name AS doctor_last_name,
    c.first_name AS creator_first_name,
    c.last_name AS creator_last_name
FROM patient_reports pr
LEFT JOIN users d ON pr.doctor_id = d.id
LEFT JOIN users c ON pr.created_by_id = c.id
WHERE pr.doctor_id = @DoctorId
ORDER BY pr.created_at DESC;";

                var reports = await connection.QueryAsync(query, new { DoctorId = doctorId });
                
                var results = new List<PatientReport>();
                foreach (var report in reports)
                {
                    var dataDict = (IDictionary<string, object>)report;
                    
                    var result = new PatientReport
                    {
                        Id = (Guid)dataDict["id"],
                        PatientId = (Guid)dataDict["patient_id"],
                        DoctorId = (Guid)dataDict["doctor_id"],
                        CreatedById = (Guid)dataDict["created_by_id"],
                        HtmlFile = (dataDict["html_file"] as string) ?? string.Empty,
                        CreatedAt = (DateTimeOffset)dataDict["created_at"],
                        UpdatedAt = (DateTimeOffset)dataDict["updated_at"]
                    };

                    if (dataDict["doctor_first_name"] != null)
                    {
                        result.Doctor = new User 
                        { 
                            FirstName = (dataDict["doctor_first_name"] as string) ?? string.Empty,
                            LastName = (dataDict["doctor_last_name"] as string) ?? string.Empty
                        };
                    }

                    if (dataDict["creator_first_name"] != null)
                    {
                        result.Creator = new User 
                        { 
                            FirstName = (dataDict["creator_first_name"] as string) ?? string.Empty,
                            LastName = (dataDict["creator_last_name"] as string) ?? string.Empty
                        };
                    }

                    results.Add(result);
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByDoctorIdAsync for doctor {DoctorId}", doctorId);
                throw new InvalidOperationException($"Failed to get patient reports for doctor {doctorId}", ex);
            }
        }

        public async Task<PatientReport> UpdateAsync(PatientReport patientReport)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    patientReport.UpdatedAt = DateTimeOffset.UtcNow;

                    var query = @"
UPDATE patient_reports
SET
    html_file = @HtmlFile,
    updated_at = @UpdatedAt
WHERE id = @Id
RETURNING
    id AS Id,
    patient_id AS PatientId,
    doctor_id AS DoctorId,
    created_by_id AS CreatedById,
    html_file AS HtmlFile,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var parameters = new
                    {
                        patientReport.Id,
                        patientReport.HtmlFile,
                        patientReport.UpdatedAt
                    };

                    var updatedReport = await connection.QuerySingleAsync<PatientReport>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedReport;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for patient report {ReportId}", patientReport.Id);
                    throw new InvalidOperationException($"Failed to update patient report with id {patientReport.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for patient report {ReportId}", patientReport.Id);
                throw new InvalidOperationException($"Failed to update patient report with id {patientReport.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM patient_reports WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for patient report {ReportId}", id);
                throw new InvalidOperationException($"Failed to delete patient report with id {id}", ex);
            }
        }
    }
}

