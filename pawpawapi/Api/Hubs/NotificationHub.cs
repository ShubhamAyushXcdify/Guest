using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Api.Hubs
{
    /// <summary>
    /// SignalR Hub for real-time notifications
    /// </summary>
    [Authorize]
    public class NotificationHub : Hub
    {
        private static readonly ConcurrentDictionary<Guid, string> _userConnections = new();
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Called when a client connects to the hub
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            try
            {
                var userId = GetUserId();
                if (userId.HasValue)
                {
                    // Update connection tracking (latest connection ID for the user)
                    _userConnections.AddOrUpdate(userId.Value, Context.ConnectionId, (key, oldValue) => Context.ConnectionId);
                    
                    // Add to SignalR group for targeted messaging
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId.Value}");
                    
                    _logger.LogDebug("User {UserId} connected to NotificationHub with connection {ConnectionId}", userId.Value, Context.ConnectionId);
                }
                else
                {
                    _logger.LogWarning("User connected without valid user ID claim. ConnectionId: {ConnectionId}", Context.ConnectionId);
                    // Disconnect unauthorized users
                    Context.Abort();
                    return;
                }

                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OnConnectedAsync for connection {ConnectionId}", Context.ConnectionId);
                Context.Abort();
            }
        }

        /// <summary>
        /// Called when a client disconnects from the hub
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                var userId = GetUserId();
                if (userId.HasValue)
                {
                    // Only remove if this is the current connection for the user
                    if (_userConnections.TryGetValue(userId.Value, out var currentConnectionId) && 
                        currentConnectionId == Context.ConnectionId)
                    {
                        _userConnections.TryRemove(userId.Value, out _);
                    }
                    
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId.Value}");
                    _logger.LogDebug("User {UserId} disconnected from NotificationHub", userId.Value);
                }

                if (exception != null)
                {
                    _logger.LogWarning(exception, "User disconnected with exception. ConnectionId: {ConnectionId}", Context.ConnectionId);
                }

                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OnDisconnectedAsync for connection {ConnectionId}", Context.ConnectionId);
            }
        }

        /// <summary>
        /// Get user ID from JWT claims
        /// </summary>
        private Guid? GetUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return null;
        }

        /// <summary>
        /// Get all active user connections (for debugging/admin purposes)
        /// </summary>
        public static int GetActiveConnectionsCount()
        {
            return _userConnections.Count;
        }

        /// <summary>
        /// Check if a user is connected
        /// </summary>
        public static bool IsUserConnected(Guid userId)
        {
            return _userConnections.ContainsKey(userId);
        }
    }
}

