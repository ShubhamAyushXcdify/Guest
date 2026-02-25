using System;

namespace Application.DTOs
{
    /// <summary>
    /// DTO for real-time notifications sent via WebSocket
    /// </summary>
    public class NotificationDto
    {
        public string Type { get; set; } = string.Empty; // "appointment_created", "appointment_updated", etc.
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public object? Data { get; set; } // Additional data specific to the notification type
    }

    /// <summary>
    /// DTO for appointment creation notification data
    /// </summary>
    public class AppointmentNotificationDataDto
    {
        public Guid AppointmentId { get; set; }
        public Guid ClinicId { get; set; }
        public string ClinicName { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public Guid? PatientId { get; set; }
        public string? PatientName { get; set; }
        public Guid? VeterinarianId { get; set; }
        public string? VeterinarianName { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan? AppointmentTimeFrom { get; set; }
        public TimeSpan? AppointmentTimeTo { get; set; }
        public Guid? AppointmentTypeId { get; set; }
        public string? AppointmentTypeName { get; set; }
        public string? Status { get; set; }
    }

    /// <summary>
    /// Response DTO for persisted notifications
    /// </summary>
    public class NotificationResponseDto
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public Guid? ClientId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime Timestamp { get; set; }
        public string? Data { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    /// <summary>
    /// Request DTO for creating a notification
    /// </summary>
    public class CreateNotificationRequestDto
    {
        public Guid UserId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Data { get; set; }
    }

    /// <summary>
    /// Request DTO for updating a notification
    /// </summary>
    public class UpdateNotificationRequestDto
    {
        public string? Type { get; set; }
        public string? Title { get; set; }
        public string? Message { get; set; }
        public bool? IsRead { get; set; }
        public string? Data { get; set; }
    }
}

