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
    public class ScreenRepository : IScreenRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ScreenRepository> _logger;

        public ScreenRepository(DapperDbContext dbContext, ILogger<ScreenRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<IEnumerable<Screen>> GetAllAsync()
        {
            using var connection = _dbContext.GetConnection();
            try
            {
                var query = @"
                    SELECT id AS Id,
                           name AS Name,
                           description AS Description,
                           created_at AS CreatedAt,
                           updated_at AS UpdatedAt
                    FROM screens
                    ORDER BY name";

                return await connection.QueryAsync<Screen>(query);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to retrieve screens.", ex);
            }
        }

        public async Task<Screen> GetByIdAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            try
            {
                var query = @"
                    SELECT id AS Id,
                           name AS Name,
                           description AS Description,
                           created_at AS CreatedAt,
                           updated_at AS UpdatedAt
                    FROM screens
                    WHERE id = @Id";

                return await connection.QuerySingleOrDefaultAsync<Screen>(query, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for screen {ScreenId}", id);
                throw new InvalidOperationException("Failed to retrieve screen.", ex);
            }
        }

        public async Task<Screen> AddAsync(Screen screen)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                screen.Id = Guid.NewGuid();
                screen.CreatedAt = DateTimeOffset.UtcNow;
                screen.UpdatedAt = DateTimeOffset.UtcNow;

                var query = @"
                    INSERT INTO screens (id, name, description, created_at, updated_at)
                    VALUES (@Id, @Name, @Description, @CreatedAt, @UpdatedAt)
                    RETURNING id AS Id, name AS Name, description AS Description, 
                              created_at AS CreatedAt, updated_at AS UpdatedAt";

                var createdScreen = await connection.QuerySingleAsync<Screen>(query, screen, transaction);
                transaction.Commit();
                return createdScreen;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in AddAsync");
                throw new InvalidOperationException("Failed to create screen.", ex);
            }
        }

        public async Task<Screen> UpdateAsync(Screen screen)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                screen.UpdatedAt = DateTimeOffset.UtcNow;

                var query = @"
                    UPDATE screens
                    SET name = @Name, 
                        description = @Description, 
                        updated_at = @UpdatedAt
                    WHERE id = @Id
                    RETURNING id AS Id, name AS Name, description AS Description, 
                              created_at AS CreatedAt, updated_at AS UpdatedAt";

                var updatedScreen = await connection.QuerySingleOrDefaultAsync<Screen>(query, screen, transaction);
                transaction.Commit();
                return updatedScreen;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for screen {ScreenId}", screen.Id);
                throw new InvalidOperationException("Failed to update screen.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                var query = "DELETE FROM screens WHERE id = @Id";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id }, transaction);
                transaction.Commit();
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in DeleteAsync for screen {ScreenId}", id);
                throw new InvalidOperationException("Failed to delete screen.", ex);
            }
        }
    }
}
