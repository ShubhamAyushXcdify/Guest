using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class NotificationPersistenceService : INotificationPersistenceService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<NotificationPersistenceService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public NotificationPersistenceService(
            INotificationRepository notificationRepository,
            IMapper mapper,
            ILogger<NotificationPersistenceService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _notificationRepository = notificationRepository ?? throw new ArgumentNullException(nameof(notificationRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public async Task<NotificationResponseDto> CreateAsync(CreateNotificationRequestDto dto)
        {
            try
            {
                var notification = _mapper.Map<Notification>(dto);
                var result = await _notificationRepository.CreateAsync(notification);
                return _mapper.Map<NotificationResponseDto>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        public async Task<NotificationResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var notification = await _notificationRepository.GetByIdAsync(id);
                if (notification == null)
                    throw new InvalidOperationException("Notification not found.");

                return _mapper.Map<NotificationResponseDto>(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for notification {NotificationId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<NotificationResponseDto>> GetByUserIdAsync(bool? isRead = null)
        {
            try
            {
                var recipientId = GetCurrentUserId();
                if (!recipientId.HasValue)
                {
                    throw new UnauthorizedAccessException("User ID not found in token.");
                }

                // Works for both users (user_id) and clients (client_id); JWT Sub is user.Id or client.Id
                var notifications = await _notificationRepository.GetByRecipientIdAsync(recipientId.Value, isRead);
                return _mapper.Map<IEnumerable<NotificationResponseDto>>(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByUserIdAsync");
                throw;
            }
        }

        public async Task<IEnumerable<NotificationResponseDto>> GetAllAsync()
        {
            try
            {
                var notifications = await _notificationRepository.GetAllAsync();
                return _mapper.Map<IEnumerable<NotificationResponseDto>>(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<NotificationResponseDto> UpdateAsync(Guid id, UpdateNotificationRequestDto dto)
        {
            try
            {
                var notification = await _notificationRepository.GetByIdAsync(id);
                if (notification == null)
                    throw new KeyNotFoundException("Notification not found.");

                _mapper.Map(dto, notification);
                var result = await _notificationRepository.UpdateAsync(notification);
                return _mapper.Map<NotificationResponseDto>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for notification {NotificationId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                return await _notificationRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for notification {NotificationId}", id);
                throw;
            }
        }

        public async Task<bool> MarkAsReadAsync(Guid id)
        {
            try
            {
                return await _notificationRepository.MarkAsReadAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in MarkAsReadAsync for notification {NotificationId}", id);
                throw;
            }
        }

        public async Task<int> GetUnreadCountAsync()
        {
            try
            {
                var recipientId = GetCurrentUserId();
                if (!recipientId.HasValue)
                {
                    throw new UnauthorizedAccessException("User ID not found in token.");
                }

                // Works for both users and clients (user_id or client_id)
                return await _notificationRepository.GetUnreadCountByRecipientIdAsync(recipientId.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUnreadCountAsync");
                throw;
            }
        }

        /// <summary>
        /// Get current user ID from HttpContext claims
        /// </summary>
        private Guid? GetCurrentUserId()
        {
            try
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                
                if (Guid.TryParse(userIdClaim, out var userId))
                {
                    return userId;
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error getting current user ID from HttpContext");
                return null;
            }
        }
    }
}
