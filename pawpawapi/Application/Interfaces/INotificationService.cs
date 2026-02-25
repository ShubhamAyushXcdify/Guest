using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    /// <summary>
    /// Service interface for managing real-time notifications via WebSocket
    /// </summary>
    public interface INotificationService
    {
        /// <summary>
        /// Send notification to specific user by user ID
        /// </summary>
        Task SendNotificationToUserAsync(Guid userId, NotificationDto notification);

        /// <summary>
        /// Send notification to all users in a clinic (clinic admin and veterinarians)
        /// </summary>
        Task SendNotificationToClinicAsync(Guid clinicId, NotificationDto notification);

        /// <summary>
        /// Send notification to clinic admin, veterinarian, and the client.
        /// Client is notified by User id when they have a user account, otherwise by Client id (real-time only).
        /// </summary>
        Task SendAppointmentNotificationAsync(Guid clinicId, Guid? veterinarianId, AppointmentNotificationDataDto appointmentData, Guid? clientUserId = null);

        /// <summary>
        /// Send cancellation notification - if cancelled by veterinarian, notify client and clinic admin; if by clinic admin, notify client and veterinarian
        /// </summary>
        Task SendAppointmentCancellationNotificationAsync(Guid clinicId, Guid? veterinarianId, Guid? clientId, AppointmentNotificationDataDto appointmentData, bool cancelledByVeterinarian);
    }
}

