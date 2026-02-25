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
    public class NotificationRepository : INotificationRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<NotificationRepository> _logger;

        public NotificationRepository(DapperDbContext dbContext, ILogger<NotificationRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Notification> CreateAsync(Notification notification)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    var parameters = new
                    {
                        notification.Id,
                        notification.UserId,
                        notification.ClientId,
                        notification.Type,
                        notification.Title,
                        notification.Message,
                        notification.IsRead,
                        notification.Timestamp,
                        notification.Data,
                        notification.CreatedAt,
                        notification.UpdatedAt
                    };

                    var query = @"
                    INSERT INTO notifications
(id, user_id, client_id, type, title, message, is_read, timestamp, data, created_at, updated_at)
VALUES
(@Id, @UserId, @ClientId, @Type, @Title, @Message, @IsRead, @Timestamp, @Data::jsonb, @CreatedAt, @UpdatedAt)
RETURNING
    id AS Id,
    user_id AS UserId,
    client_id AS ClientId,
    type AS Type,
    title AS Title,
    message AS Message,
    is_read AS IsRead,
    timestamp AS Timestamp,
    COALESCE(data::text, NULL) AS Data,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var createdNotification = await connection.QuerySingleAsync<Notification>(query, parameters, transaction);
                    transaction.Commit();
                    return createdNotification;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create notification", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create notification", ex);
            }
        }

        public async Task<Notification> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    user_id AS UserId,
    client_id AS ClientId,
    type AS Type,
    title AS Title,
    message AS Message,
    is_read AS IsRead,
    timestamp AS Timestamp,
    COALESCE(data::text, NULL) AS Data,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM notifications 
WHERE id = @Id;";

                var notification = await connection.QuerySingleOrDefaultAsync<Notification>(query, new { Id = id });
                return notification;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for notification {NotificationId}", id);
                throw new InvalidOperationException($"Failed to get notification with id {id}", ex);
            }
        }

        public async Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, bool? isRead = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var whereClause = "WHERE user_id = @UserId";
                object parameters;

                if (isRead.HasValue)
                {
                    whereClause += " AND is_read = @IsRead";
                    parameters = new { UserId = userId, IsRead = isRead.Value };
                }
                else
                {
                    parameters = new { UserId = userId };
                }

                var query = $@"
SELECT 
    id AS Id,
    user_id AS UserId,
    client_id AS ClientId,
    type AS Type,
    title AS Title,
    message AS Message,
    is_read AS IsRead,
    timestamp AS Timestamp,
    COALESCE(data::text, NULL) AS Data,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM notifications
{whereClause}
ORDER BY created_at DESC;";

                var notifications = await connection.QueryAsync<Notification>(query, parameters);
                return notifications;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByUserIdAsync for user {UserId}", userId);
                throw new InvalidOperationException($"Failed to get notifications for user {userId}", ex);
            }
        }

        public async Task<IEnumerable<Notification>> GetByRecipientIdAsync(Guid recipientId, bool? isRead = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var whereClause = "WHERE (user_id = @RecipientId OR client_id = @RecipientId)";
                object parameters;

                if (isRead.HasValue)
                {
                    whereClause += " AND is_read = @IsRead";
                    parameters = new { RecipientId = recipientId, IsRead = isRead.Value };
                }
                else
                {
                    parameters = new { RecipientId = recipientId };
                }

                var query = $@"
SELECT 
    id AS Id,
    user_id AS UserId,
    client_id AS ClientId,
    type AS Type,
    title AS Title,
    message AS Message,
    is_read AS IsRead,
    timestamp AS Timestamp,
    COALESCE(data::text, NULL) AS Data,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM notifications
{whereClause}
ORDER BY created_at DESC;";

                var notifications = await connection.QueryAsync<Notification>(query, parameters);
                return notifications;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByRecipientIdAsync for recipient {RecipientId}", recipientId);
                throw new InvalidOperationException($"Failed to get notifications for recipient {recipientId}", ex);
            }
        }

        public async Task<IEnumerable<Notification>> GetAllAsync()
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    id AS Id,
    user_id AS UserId,
    client_id AS ClientId,
    type AS Type,
    title AS Title,
    message AS Message,
    is_read AS IsRead,
    timestamp AS Timestamp,
    COALESCE(data::text, NULL) AS Data,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM notifications
ORDER BY created_at DESC;";

                var notifications = await connection.QueryAsync<Notification>(query);
                return notifications;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get all notifications", ex);
            }
        }

        public async Task<Notification> UpdateAsync(Notification notification)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    var setClauses = new List<string>();
                    var parameters = new DynamicParameters();
                    parameters.Add("Id", notification.Id);

                    if (!string.IsNullOrWhiteSpace(notification.Type))
                    {
                        setClauses.Add("type = @Type");
                        parameters.Add("Type", notification.Type);
                    }

                    if (!string.IsNullOrWhiteSpace(notification.Title))
                    {
                        setClauses.Add("title = @Title");
                        parameters.Add("Title", notification.Title);
                    }

                    if (!string.IsNullOrWhiteSpace(notification.Message))
                    {
                        setClauses.Add("message = @Message");
                        parameters.Add("Message", notification.Message);
                    }

                    setClauses.Add("is_read = @IsRead");
                    parameters.Add("IsRead", notification.IsRead);

                    if (notification.Data != null)
                    {
                        setClauses.Add("data = @Data::jsonb");
                        parameters.Add("Data", notification.Data);
                    }

                    setClauses.Add("updated_at = CURRENT_TIMESTAMP");

                    if (setClauses.Count == 2) // Only is_read and updated_at, nothing else changed
                        throw new InvalidOperationException("No fields to update.");

                    var setClause = string.Join(", ", setClauses);
                    var query = @"
UPDATE notifications
SET " + setClause + @"
WHERE id = @Id
RETURNING 
    id AS Id,
    user_id AS UserId,
    type AS Type,
    title AS Title,
    message AS Message,
    is_read AS IsRead,
    timestamp AS Timestamp,
    COALESCE(data::text, NULL) AS Data,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var updatedNotification = await connection.QuerySingleAsync<Notification>(query, parameters, transaction);
                    transaction.Commit();
                    return updatedNotification;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for notification {NotificationId}", notification.Id);
                    throw new InvalidOperationException($"Failed to update notification with id {notification.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for notification {NotificationId}", notification.Id);
                throw new InvalidOperationException($"Failed to update notification with id {notification.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM notifications WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for notification {NotificationId}", id);
                throw new InvalidOperationException($"Failed to delete notification with id {id}", ex);
            }
        }

        public async Task<bool> MarkAsReadAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
UPDATE notifications
SET is_read = true, updated_at = CURRENT_TIMESTAMP
WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in MarkAsReadAsync for notification {NotificationId}", id);
                throw new InvalidOperationException($"Failed to mark notification {id} as read", ex);
            }
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT COUNT(*)
FROM notifications
WHERE user_id = @UserId AND is_read = false;";
                var count = await connection.QuerySingleAsync<int>(query, new { UserId = userId });
                return count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUnreadCountAsync for user {UserId}", userId);
                throw new InvalidOperationException($"Failed to get unread count for user {userId}", ex);
            }
        }

        public async Task<int> GetUnreadCountByRecipientIdAsync(Guid recipientId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT COUNT(*)
FROM notifications
WHERE (user_id = @RecipientId OR client_id = @RecipientId) AND is_read = false;";
                var count = await connection.QuerySingleAsync<int>(query, new { RecipientId = recipientId });
                return count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUnreadCountByRecipientIdAsync for recipient {RecipientId}", recipientId);
                throw new InvalidOperationException($"Failed to get unread count for recipient {recipientId}", ex);
            }
        }
    }
}
