using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface INotificationRepository
    {
        Task<Notification> CreateAsync(Notification notification);
        Task<Notification> GetByIdAsync(Guid id);
        Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, bool? isRead = null);
        /// <summary>Get notifications for a recipient (user_id = id OR client_id = id). Use for both users and clients.</summary>
        Task<IEnumerable<Notification>> GetByRecipientIdAsync(Guid recipientId, bool? isRead = null);
        Task<IEnumerable<Notification>> GetAllAsync();
        Task<Notification> UpdateAsync(Notification notification);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> MarkAsReadAsync(Guid id);
        Task<int> GetUnreadCountAsync(Guid userId);
        /// <summary>Unread count for a recipient (user_id = id OR client_id = id).</summary>
        Task<int> GetUnreadCountByRecipientIdAsync(Guid recipientId);
    }
}
