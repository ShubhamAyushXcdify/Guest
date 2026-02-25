using System;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using System.Data;

namespace Infrastructure.Repositories
{
    public class VitalDetailRepository : IVitalDetailRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<VitalDetailRepository> _logger;

        public VitalDetailRepository(DapperDbContext dbContext, ILogger<VitalDetailRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<VitalDetail> CreateAsync(VitalDetail vitalDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    vitalDetail.Id = Guid.NewGuid();
                    vitalDetail.CreatedAt = DateTimeOffset.UtcNow;
                    vitalDetail.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        vitalDetail.Id,
                        vitalDetail.VisitId,
                        vitalDetail.TemperatureC,
                        vitalDetail.HeartRateBpm,
                        vitalDetail.RespiratoryRateBpm,
                        vitalDetail.MucousMembraneColor,
                        vitalDetail.CapillaryRefillTimeSec,
                        vitalDetail.HydrationStatus,
                        vitalDetail.Notes,
                        vitalDetail.IsCompleted,
                        vitalDetail.CreatedAt,
                        vitalDetail.UpdatedAt
                    };

                    var query = @"
INSERT INTO vital_details 
(id, visit_id, temperature_c, heart_rate_bpm, respiratory_rate_bpm, mucous_membrane_color, 
capillary_refill_time_sec, hydration_status, notes, is_completed, created_at, updated_at) 
VALUES 
(@Id, @VisitId, @TemperatureC, @HeartRateBpm, @RespiratoryRateBpm, @MucousMembraneColor, 
@CapillaryRefillTimeSec, @HydrationStatus, @Notes, @IsCompleted, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    visit_id AS VisitId,
    temperature_c AS TemperatureC,
    heart_rate_bpm AS HeartRateBpm,
    respiratory_rate_bpm AS RespiratoryRateBpm,
    mucous_membrane_color AS MucousMembraneColor,
    capillary_refill_time_sec AS CapillaryRefillTimeSec,
    hydration_status AS HydrationStatus,
    notes AS Notes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var createdVitalDetail = await connection.QuerySingleAsync<VitalDetail>(query, parameters, transaction);
                    transaction.Commit();
                    return createdVitalDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create vital detail", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create vital detail", ex);
            }
        }

        public async Task<VitalDetail> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    visit_id AS VisitId,
    temperature_c AS TemperatureC,
    heart_rate_bpm AS HeartRateBpm,
    respiratory_rate_bpm AS RespiratoryRateBpm,
    mucous_membrane_color AS MucousMembraneColor,
    capillary_refill_time_sec AS CapillaryRefillTimeSec,
    hydration_status AS HydrationStatus,
    notes AS Notes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM vital_details 
WHERE id = @Id;";

                return await connection.QuerySingleOrDefaultAsync<VitalDetail>(query, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for vital detail {VitalDetailId}", id);
                throw new InvalidOperationException($"Failed to get vital detail with id {id}", ex);
            }
        }

        public async Task<VitalDetail> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    visit_id AS VisitId,
    temperature_c AS TemperatureC,
    heart_rate_bpm AS HeartRateBpm,
    respiratory_rate_bpm AS RespiratoryRateBpm,
    mucous_membrane_color AS MucousMembraneColor,
    capillary_refill_time_sec AS CapillaryRefillTimeSec,
    hydration_status AS HydrationStatus,
    notes AS Notes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM vital_details 
WHERE visit_id = @VisitId
ORDER BY created_at DESC;";

                var vitalDetails = await connection.QueryAsync<VitalDetail>(query, new { VisitId = visitId });
                return vitalDetails.FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to get vital detail for visit {visitId}", ex);
            }
        }

        public async Task<VitalDetail> UpdateAsync(VitalDetail vitalDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    vitalDetail.UpdatedAt = DateTimeOffset.UtcNow;

                    var setClauses = new List<string>();
                    var parameters = new DynamicParameters();
                    parameters.Add("Id", vitalDetail.Id);

                    if (vitalDetail.TemperatureC.HasValue)
                    {
                        setClauses.Add("temperature_c = @TemperatureC");
                        parameters.Add("TemperatureC", vitalDetail.TemperatureC);
                    }

                    if (vitalDetail.HeartRateBpm.HasValue)
                    {
                        setClauses.Add("heart_rate_bpm = @HeartRateBpm");
                        parameters.Add("HeartRateBpm", vitalDetail.HeartRateBpm);
                    }

                    if (vitalDetail.RespiratoryRateBpm.HasValue)
                    {
                        setClauses.Add("respiratory_rate_bpm = @RespiratoryRateBpm");
                        parameters.Add("RespiratoryRateBpm", vitalDetail.RespiratoryRateBpm);
                    }

                    if (vitalDetail.MucousMembraneColor != null)
                    {
                        setClauses.Add("mucous_membrane_color = @MucousMembraneColor");
                        parameters.Add("MucousMembraneColor", vitalDetail.MucousMembraneColor);
                    }

                    if (vitalDetail.CapillaryRefillTimeSec.HasValue)
                    {
                        setClauses.Add("capillary_refill_time_sec = @CapillaryRefillTimeSec");
                        parameters.Add("CapillaryRefillTimeSec", vitalDetail.CapillaryRefillTimeSec);
                    }

                    if (vitalDetail.HydrationStatus != null)
                    {
                        setClauses.Add("hydration_status = @HydrationStatus");
                        parameters.Add("HydrationStatus", vitalDetail.HydrationStatus);
                    }

                    if (vitalDetail.Notes != null)
                    {
                        setClauses.Add("notes = @Notes");
                        parameters.Add("Notes", vitalDetail.Notes);
                    }

                    setClauses.Add("is_completed = @IsCompleted");
                    parameters.Add("IsCompleted", vitalDetail.IsCompleted);

                    setClauses.Add("updated_at = @UpdatedAt");
                    parameters.Add("UpdatedAt", vitalDetail.UpdatedAt);

                    var setClause = string.Join(", ", setClauses);
                    var query = @"
UPDATE vital_details
SET " + setClause + @"
WHERE id = @Id
RETURNING 
    id AS Id,
    visit_id AS VisitId,
    temperature_c AS TemperatureC,
    heart_rate_bpm AS HeartRateBpm,
    respiratory_rate_bpm AS RespiratoryRateBpm,
    mucous_membrane_color AS MucousMembraneColor,
    capillary_refill_time_sec AS CapillaryRefillTimeSec,
    hydration_status AS HydrationStatus,
    notes AS Notes,
    is_completed AS IsCompleted,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var updatedVitalDetail = await connection.QuerySingleAsync<VitalDetail>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedVitalDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for vital detail {VitalDetailId}", vitalDetail.Id);
                    throw new InvalidOperationException($"Failed to update vital detail with id {vitalDetail.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for vital detail {VitalDetailId}", vitalDetail.Id);
                throw new InvalidOperationException($"Failed to update vital detail with id {vitalDetail.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM vital_details WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for vital detail {VitalDetailId}", id);
                throw new InvalidOperationException($"Failed to delete vital detail with id {id}", ex);
            }
        }
    }
} 