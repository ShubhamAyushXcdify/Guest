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
    public class ScreenAccessRepository : IScreenAccessRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ScreenAccessRepository> _logger;

        public ScreenAccessRepository(DapperDbContext dbContext, ILogger<ScreenAccessRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<IEnumerable<ScreenAccess>> GetByClinicIdAsync(Guid clinicId, Guid? roleId = null)
        {
            using var connection = _dbContext.GetConnection();
            try
            {
                var query = @"
                    SELECT
                        sa.id AS Id,
                        sa.screen_id AS ScreenId,
                        s.name AS ScreenName,
                        --sa.company_id AS CompanyId,
                        --c.name AS CompanyName,
                        sa.clinic_id AS ClinicId,
                        c.name AS CLinicName,
                        sa.role_id AS RoleId,
                        r.name AS RoleName,
                        sa.is_access_enable AS IsAccessEnable,
                        sa.created_at AS CreatedAt,
                        sa.updated_at AS UpdatedAt
                    FROM screen_access sa
                    LEFT JOIN screens s ON sa.screen_id = s.id
                    LEFT JOIN clinics c ON sa.clinic_id = c.id
                    LEFT JOIN roles r ON sa.role_id = r.id
                    WHERE sa.clinic_id = @ClinicId";

                var parameters = new { ClinicId = clinicId, RoleId = roleId };

                if (roleId.HasValue)
                {
                    query += " AND sa.role_id = @RoleId";
                }

                query += " ORDER BY s.name, r.name";

                return await connection.QueryAsync<ScreenAccess>(query, parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByCompanyIdAsync for company {CompanyId} and role {RoleId}", clinicId, roleId);
                throw new InvalidOperationException("Failed to retrieve screen access.", ex);
            }
        }

        public async Task<ScreenAccess> GetByScreenRoleCompanyAsync(Guid screenId, Guid roleId, Guid clinicId)
        {
            using var connection = _dbContext.GetConnection();
            try
            {
                var query = @"
                    SELECT 
                        sa.id AS Id,
                        sa.screen_id AS ScreenId,
                        s.name AS ScreenName,
                        sa.clinic_id AS ClinicId,
                        c.name AS ClinicName,
                        sa.role_id AS RoleId,
                        r.name AS RoleName,
                        sa.is_access_enable AS IsAccessEnable,
                        sa.created_at AS CreatedAt,
                        sa.updated_at AS UpdatedAt
                    FROM screen_access sa
                    LEFT JOIN screens s ON sa.screen_id = s.id
                    LEFT JOIN clinics c ON sa.clinic_id = c.id
                    LEFT JOIN roles r ON sa.role_id = r.id
                    WHERE sa.screen_id = @ScreenId 
                      AND sa.role_id = @RoleId 
                      AND sa.clinic_id = @ClinicId";

                return await connection.QuerySingleOrDefaultAsync<ScreenAccess>(query, 
                    new { ScreenId = screenId, RoleId = roleId, ClinicId = clinicId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByScreenRoleCompanyAsync");
                throw new InvalidOperationException("Failed to retrieve screen access.", ex);
            }
        }

        public async Task<ScreenAccess> AddAsync(ScreenAccess screenAccess)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                screenAccess.Id = Guid.NewGuid();
                screenAccess.CreatedAt = DateTimeOffset.UtcNow;
                screenAccess.UpdatedAt = DateTimeOffset.UtcNow;

                var query = @"
                    INSERT INTO screen_access (id, screen_id, company_id, role_id, is_access_enable, created_at, updated_at)
                    VALUES (@Id, @ScreenId, @CompanyId, @RoleId, @IsAccessEnable, @CreatedAt, @UpdatedAt)
                    RETURNING id AS Id, screen_id AS ScreenId, company_id AS CompanyId, role_id AS RoleId, 
                              is_access_enable AS IsAccessEnable, created_at AS CreatedAt, updated_at AS UpdatedAt";

                var createdScreenAccess = await connection.QuerySingleAsync<ScreenAccess>(query, screenAccess, transaction);
                transaction.Commit();
                return createdScreenAccess;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in AddAsync");
                throw new InvalidOperationException("Failed to create screen access.", ex);
            }
        }

        public async Task<ScreenAccess> UpdateAsync(ScreenAccess screenAccess)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                screenAccess.UpdatedAt = DateTimeOffset.UtcNow;

                var query = @"
                    UPDATE screen_access
                    SET is_access_enable = @IsAccessEnable, 
                        updated_at = @UpdatedAt
                    WHERE id = @Id
                    RETURNING id AS Id, screen_id AS ScreenId, company_id AS CompanyId, role_id AS RoleId, 
                              is_access_enable AS IsAccessEnable, created_at AS CreatedAt, updated_at AS UpdatedAt";

                var updatedScreenAccess = await connection.QuerySingleOrDefaultAsync<ScreenAccess>(query, screenAccess, transaction);
                transaction.Commit();
                return updatedScreenAccess;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for screen access {ScreenAccessId}", screenAccess.Id);
                throw new InvalidOperationException("Failed to update screen access.", ex);
            }
        }

        public async Task<bool> UpsertScreenAccessAsync(Guid screenId, Guid roleId, Guid clinicId, bool isAccessEnable)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                var now = DateTimeOffset.UtcNow;

                // First, try to find existing record
                var existingRecord = await GetByScreenRoleCompanyAsync(screenId, roleId, clinicId);

                if (existingRecord != null)
                {
                    // Update existing record
                    var updateQuery = @"
                        UPDATE screen_access
                        SET is_access_enable = @IsAccessEnable,
                            updated_at = @UpdatedAt
                        WHERE screen_id = @ScreenId
                          AND role_id = @RoleId
                          AND clinic_id = @ClinicId";

                    var updateResult = await connection.ExecuteAsync(updateQuery, new
                    {
                        ScreenId = screenId,
                        RoleId = roleId,
                        ClinicId = clinicId,
                        IsAccessEnable = isAccessEnable,
                        UpdatedAt = now
                    }, transaction);

                    transaction.Commit();
                    return updateResult > 0;
                }
                else
                {
                    // Insert new record
                    var newId = Guid.NewGuid();
                    var insertQuery = @"
                        INSERT INTO screen_access (id, screen_id, clinic_id, role_id, is_access_enable, created_at, updated_at)
                        VALUES (@Id, @ScreenId, @ClinicId, @RoleId, @IsAccessEnable, @CreatedAt, @UpdatedAt)";

                    var insertResult = await connection.ExecuteAsync(insertQuery, new
                    {
                        Id = newId,
                        ScreenId = screenId,
                        ClinicId = clinicId,
                        RoleId = roleId,
                        IsAccessEnable = isAccessEnable,
                        CreatedAt = now,
                        UpdatedAt = now
                    }, transaction);

                    transaction.Commit();
                    return insertResult > 0;
                }
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpsertScreenAccessAsync");
                throw new InvalidOperationException("Failed to upsert screen access.", ex);
            }
        }
    }
}
