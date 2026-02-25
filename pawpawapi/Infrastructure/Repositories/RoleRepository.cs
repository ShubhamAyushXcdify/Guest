using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<RoleRepository> _logger;

        public RoleRepository(DapperDbContext dbContext, ILogger<RoleRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Role> CreateAsync(Role role)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    var parameters = new
                    {
                        role.Id,
                        role.Name,
                        role.Value,
                        role.IsPrivileged,
                        role.Metadata,
                        role.CreatedAt,
                        role.UpdatedAt,
                        role.ColourName,
                        role.IsClinicRequired,
                        role.Priority
                    };

                    var query = @"
                    INSERT INTO roles
(id, name, value, is_privileged, metadata, created_at, updated_at,colour_name,is_clinic_required, priority)
VALUES
(@Id, @Name, @Value, @IsPrivileged, @Metadata::jsonb, @CreatedAt, @UpdatedAt,@ColourName, @IsClinicRequired, @Priority)
RETURNING
    id AS Id,
    name AS Name,
    value AS Value,
    is_privileged AS IsPrivileged,
    COALESCE(metadata, '{}'::jsonb) AS Metadata,
    created_at AS CreatedAt,
    colour_name AS ColourName,
    is_clinic_required AS IsClinicRequired,
    priority AS Priority;";

                    var createdRole = await connection.QuerySingleAsync<Role>(query, parameters, transaction);
                    transaction.Commit();
                    return createdRole;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create role", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create role", ex);
            }
        }

        public async Task<Role?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    name AS Name,
    value AS Value,
    is_privileged AS IsPrivileged,
    COALESCE(metadata, '{}') AS Metadata,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    colour_name AS ColourName,
    is_clinic_required AS IsClinicRequired,
    priority AS Priority
FROM roles 
WHERE id = @Id;";

                var role = await connection.QuerySingleOrDefaultAsync<Role>(query, new { Id = id });
                return role;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for role {RoleId}", id);
                throw new InvalidOperationException($"Failed to get role with id {id}", ex);
            }
        }

        public async Task<IEnumerable<Role>> GetAllAsync()
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
                    SELECT 
                        id AS Id,
                        name AS Name,
                        value AS Value,
                        is_privileged AS IsPrivileged,
                        COALESCE(metadata, '{}') AS Metadata,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt,
                        colour_name AS ColourName,
                        is_clinic_required AS IsClinicRequired,
                        priority AS Priority
                    FROM roles
                    Order by created_at DESC;";

                var roles = await connection.QueryAsync<Role>(query);
                return roles;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get all roles", ex);
            }
        }

        public async Task<Role> UpdateAsync(Role role)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    var setClauses = new List<string>();
                    var parameters = new DynamicParameters();
                    parameters.Add("Id", role.Id);

                    if (!string.IsNullOrWhiteSpace(role.Name))
                    {
                        setClauses.Add("name = @Name");
                        parameters.Add("Name", role.Name);
                    }
                    if (!string.IsNullOrWhiteSpace(role.ColourName))
                    {
                        setClauses.Add("colour_name = @ColourName");
                        parameters.Add("ColourName", role.ColourName);
                    }

                    if (!string.IsNullOrWhiteSpace(role.Value))
                    {
                        setClauses.Add("value = @Value");
                        parameters.Add("Value", role.Value);
                    }
                    
                    setClauses.Add("is_clinic_required = @IsClinicRequired");
                    parameters.Add("IsClinicRequired", role.IsClinicRequired);

                    setClauses.Add("is_privileged = @IsPrivileged");
                    parameters.Add("IsPrivileged", role.IsPrivileged);

                    setClauses.Add("metadata = @Metadata");
                    parameters.Add("Metadata", role.Metadata);

                    setClauses.Add("updated_at = CURRENT_TIMESTAMP");

                    if (role.Priority != 0)
                    {
                        setClauses.Add("priority = @Priority");
                        parameters.Add("Priority", role.Priority);
                    }

                    if (setClauses.Count == 1) // Only updated_at, nothing else changed
                        throw new InvalidOperationException("No fields to update.");

                    var setClause = string.Join(", ", setClauses);
                    var query = @"
UPDATE roles
SET " + setClause + @"
WHERE id = @Id
RETURNING 
    id AS Id,
    name AS Name,
    value AS Value,
    is_privileged AS IsPrivileged,
    COALESCE(metadata, '{}') AS Metadata,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    colour_name AS ColourName,
    is_clinic_required AS IsClinicRequired,
    priority AS Priority;";

                    var updatedRole = await connection.QuerySingleAsync<Role>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedRole;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for role {RoleId}", role.Id);
                    throw new InvalidOperationException($"Failed to update role with id {role.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for role {RoleId}", role.Id);
                throw new InvalidOperationException($"Failed to update role with id {role.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM roles WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for role {RoleId}", id);
                throw new InvalidOperationException($"Failed to delete role with id {id}", ex);
            }
        }
    }
} 