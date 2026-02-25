using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    /// <summary>
    /// Service interface for managing persisted notifications (CRUD operations)
    /// </summary>
    public interface INotificationPersistenceService
    {
        Task<NotificationResponseDto> CreateAsync(CreateNotificationRequestDto dto);
        Task<NotificationResponseDto> GetByIdAsync(Guid id);
        Task<IEnumerable<NotificationResponseDto>> GetByUserIdAsync(bool? isRead = null);
        Task<IEnumerable<NotificationResponseDto>> GetAllAsync();
        Task<NotificationResponseDto> UpdateAsync(Guid id, UpdateNotificationRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> MarkAsReadAsync(Guid id);
        Task<int> GetUnreadCountAsync();
    }
}
