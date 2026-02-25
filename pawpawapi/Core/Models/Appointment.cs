using System;

namespace Core.Models
{
    public class Appointment
    {
        public Guid Id { get; set; }
        public Guid? ClinicId { get; set; }
        public Guid? CompanyId { get; set; }
        public Guid? PatientId { get; set; }
        public Guid? ClientId { get; set; }
        public Guid? VeterinarianId { get; set; }
        public Guid? RoomId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan? AppointmentTimeFrom { get; set; }
        public TimeSpan? AppointmentTimeTo { get; set; }
        public Guid? RoomSlotId { get; set; }
        public Guid? AppointmentTypeId { get; set; }
        public string? Reason { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
        public bool IsRegistered { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
} 