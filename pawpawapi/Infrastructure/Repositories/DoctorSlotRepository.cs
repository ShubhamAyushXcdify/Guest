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
    public class DoctorSlotRepository : IDoctorSlotRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<DoctorSlotRepository> _logger;

        public DoctorSlotRepository(DapperDbContext dbContext, ILogger<DoctorSlotRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<DoctorSlot> CreateAsync(DoctorSlot slot)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Generate new ID if not provided
                if (slot.Id == Guid.Empty)
                {
                    slot.Id = Guid.NewGuid();
                }

                // Set timestamps
                slot.CreatedAt = DateTime.UtcNow;
                slot.UpdatedAt = DateTime.UtcNow;
                slot.IsActive = true;

                const string sql = @"
                    INSERT INTO doctor_slot (
                        id, day, start_time, end_time, is_active, created_at, updated_at
                    ) VALUES (
                        @Id, @Day, @StartTime, @EndTime, @IsActive, @CreatedAt, @UpdatedAt
                    )
                    RETURNING
                        id AS Id, day AS Day, start_time AS StartTime, end_time AS EndTime,
                        created_at AS CreatedAt, updated_at AS UpdatedAt, is_active AS IsActive;";

                var parameters = new
                {
                    slot.Id,
                    slot.Day,
                    slot.StartTime,
                    slot.EndTime,
                    slot.IsActive,
                    slot.CreatedAt,
                    slot.UpdatedAt
                };

                var created = await connection.QuerySingleAsync<DoctorSlot>(sql, parameters, transaction);
                transaction.Commit();
                return created;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in CreateAsync for doctor slot");
                throw new InvalidOperationException("Failed to create doctor slot.", ex);
            }
        }

        public async Task<DoctorSlot?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT
                        id AS Id, day AS Day, start_time AS StartTime, end_time AS EndTime,
                        created_at AS CreatedAt, updated_at AS UpdatedAt, is_active AS IsActive
                    FROM doctor_slot
                    WHERE id = @Id AND is_active = true;";

                return await connection.QuerySingleOrDefaultAsync<DoctorSlot>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for doctor slot {Id}", id);
                throw new InvalidOperationException($"Failed to retrieve doctor slot with id {id}.", ex);
            }
        }

        public async Task<IEnumerable<DoctorSlot>> GetAllAsync()
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT
                        id AS Id, day AS Day, start_time AS StartTime, end_time AS EndTime,
                        created_at AS CreatedAt, updated_at AS UpdatedAt, is_active AS IsActive
                    FROM doctor_slot
                    WHERE is_active = true
                    ORDER BY day, start_time;";

                return await connection.QueryAsync<DoctorSlot>(sql);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync for doctor slots");
                throw new InvalidOperationException("Failed to retrieve doctor slots.", ex);
            }
        }

        public async Task<DoctorSlot> UpdateAsync(DoctorSlot slot)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Set updated timestamp
                slot.UpdatedAt = DateTime.UtcNow;

                const string sql = @"
                    UPDATE doctor_slot SET
                        day = @Day,
                        start_time = @StartTime,
                        end_time = @EndTime,
                        updated_at = @UpdatedAt
                    WHERE id = @Id AND is_active = true
                    RETURNING
                        id AS Id, day AS Day, start_time AS StartTime, end_time AS EndTime,
                        created_at AS CreatedAt, updated_at AS UpdatedAt, is_active AS IsActive;";

                var parameters = new
                {
                    slot.Id,
                    slot.Day,
                    slot.StartTime,
                    slot.EndTime,
                    slot.UpdatedAt
                };

                var updated = await connection.QuerySingleAsync<DoctorSlot>(sql, parameters, transaction);
                transaction.Commit();
                return updated;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for doctor slot {Id}", slot.Id);
                throw new InvalidOperationException($"Failed to update doctor slot with id {slot.Id}.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    UPDATE doctor_slot
                    SET is_active = false, updated_at = CURRENT_TIMESTAMP
                    WHERE id = @Id AND is_active = true;";

                var rows = await connection.ExecuteAsync(sql, new { Id = id });
                return rows > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for doctor slot {Id}", id);
                throw new InvalidOperationException($"Failed to delete doctor slot with id {id}.", ex);
            }
        }
    }
}