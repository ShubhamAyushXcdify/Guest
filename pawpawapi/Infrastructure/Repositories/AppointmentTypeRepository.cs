using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class AppointmentTypeRepository : IAppointmentTypeRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<AppointmentTypeRepository> _logger;

        public AppointmentTypeRepository(DapperDbContext dbContext, ILogger<AppointmentTypeRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<IEnumerable<AppointmentType>> GetAllAsync()
        {
            using var connection = _dbContext.GetConnection();
            try
            {
                var query = @"
                    SELECT appointment_type_id AS AppointmentTypeId,
                           name AS Name,
                           is_active AS IsActive
                    FROM appointment_type
                    ORDER BY name";

                return await connection.QueryAsync<AppointmentType>(query);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to retrieve appointment types.", ex);
            }
        }

        public async Task<AppointmentType> GetByIdAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            try
            {
                var query = @"
                    SELECT appointment_type_id AS AppointmentTypeId,
                           name AS Name,
                           is_active AS IsActive
                    FROM appointment_type
                    WHERE appointment_type_id = @Id";

                return await connection.QuerySingleOrDefaultAsync<AppointmentType>(query, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for appointment type {AppointmentTypeId}", id);
                throw new InvalidOperationException("Failed to retrieve appointment type.", ex);
            }
        }

        public async Task<AppointmentType> AddAsync(AppointmentType appointmentType)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                appointmentType.AppointmentTypeId = Guid.NewGuid();

                var query = @"
                    INSERT INTO appointment_type (appointment_type_id, name, is_active)
                    VALUES (@AppointmentTypeId, @Name, @IsActive)
                    RETURNING appointment_type_id AS AppointmentTypeId, name AS Name, is_active AS IsActive";

                var createdAppointmentType = await connection.QuerySingleAsync<AppointmentType>(query, appointmentType, transaction);
                transaction.Commit();
                return createdAppointmentType;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in AddAsync");
                throw new InvalidOperationException("Failed to create appointment type.", ex);
            }
        }

        public async Task<AppointmentType> UpdateAsync(AppointmentType appointmentType)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                var query = @"
                    UPDATE appointment_type
                    SET name = @Name, is_active = @IsActive
                    WHERE appointment_type_id = @AppointmentTypeId
                    RETURNING appointment_type_id AS AppointmentTypeId, name AS Name, is_active AS IsActive";

                var updatedAppointmentType = await connection.QuerySingleOrDefaultAsync<AppointmentType>(query, appointmentType, transaction);
                transaction.Commit();
                return updatedAppointmentType;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for appointment type {AppointmentTypeId}", appointmentType.AppointmentTypeId);
                throw new InvalidOperationException("Failed to update appointment type.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                var query = "DELETE FROM appointment_type WHERE appointment_type_id = @Id";
                var affectedRows = await connection.ExecuteAsync(query, new { Id = id }, transaction);
                transaction.Commit();
                return affectedRows > 0;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in DeleteAsync for appointment type {AppointmentTypeId}", id);
                throw new InvalidOperationException("Failed to delete appointment type.", ex);
            }
        }
    }
}
    