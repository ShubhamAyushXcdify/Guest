using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class AppointmentResponseDto
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

        // Related information
        public ClinicResponseDto? Clinic { get; set; }
        public PatientResponseDto? Patient { get; set; }
        public ClientResponseDto? Client { get; set; }
        public UserResponseDto? Veterinarian { get; set; }
        public RoomResponseDto? Room { get; set; }
        public AppointmentTypeResponseDto? AppointmentType { get; set; }
    }

    public class CreateAppointmentRequestDto
    {
        public Guid? ClinicId { get; set; }
        public Guid? PatientId { get; set; }
        public Guid? ClientId { get; set; }
        public Guid? VeterinarianId { get; set; }
        public Guid? RoomId { get; set; }
        
        [Required]
        public DateTime AppointmentDate { get; set; }
        
        public TimeSpan? AppointmentTimeFrom { get; set; }
        public TimeSpan? AppointmentTimeTo { get; set; }
        public Guid? AppointmentTypeId { get; set; }
        
        [MaxLength(500)]
        public string? Reason { get; set; }
        
        [MaxLength(50)]
        public string? Status { get; set; }
        
        [MaxLength(1000)]
        public string? Notes { get; set; }
        
        public bool IsRegistered { get; set; }
        public Guid? CreatedBy { get; set; }
    }

    public class UpdateAppointmentRequestDto
    {
        [Required]
        public Guid Id { get; set; }
        
        public Guid? ClinicId { get; set; }
        public Guid? PatientId { get; set; }
        public Guid? ClientId { get; set; }
        public Guid? VeterinarianId { get; set; }
        public Guid? RoomId { get; set; }
        
        [Required]
        public DateTime AppointmentDate { get; set; }
        
        public TimeSpan? AppointmentTimeFrom { get; set; }
        public TimeSpan? AppointmentTimeTo { get; set; }
        public Guid? AppointmentTypeId { get; set; }
        
        [MaxLength(500)]
        public string? Reason { get; set; }
        
        [MaxLength(50)]
        public string? Status { get; set; }
        
        [MaxLength(1000)]
        public string? Notes { get; set; }
        
        public bool IsRegistered { get; set; }
        public Guid? CreatedBy { get; set; }
        public bool SendEmail { get; set; } = false;
    }
}
