using System;

namespace Application.DTOs
{
    public class SurgeryDischargeSummaryResponseDto
    {
        // Visit Information
        public Guid VisitId { get; set; }
        public Guid AppointmentId { get; set; }
        public Guid? PatientId { get; set; }
        public DateTimeOffset? VisitCreatedAt { get; set; }
        public DateTimeOffset? VisitUpdatedAt { get; set; }

        // Surgery Visit Completion Status
        public bool? IsSurgeryPreOpCompleted { get; set; }
        public bool? IsSurgeryDetailsCompleted { get; set; }
        public bool? IsSurgeryPostOpCompleted { get; set; }
        public bool? IsSurgeryDischargeCompleted { get; set; }

        // Appointment Information
        public AppointmentResponseDto? Appointment { get; set; }

        // Patient Information
        public PatientResponseDto? Patient { get; set; }

        // Client Information
        public ClientResponseDto? Client { get; set; }

        // Veterinarian Information
        public UserResponseDto? Veterinarian { get; set; }

        // Clinic Information
        public ClinicResponseDto? Clinic { get; set; }

        // Room Information
        public RoomResponseDto? Room { get; set; }

        // Surgery Visit Details
        public SurgeryPreOpResponseDto? SurgeryPreOp { get; set; }
        public SurgeryDetailResponseDto? SurgeryDetail { get; set; }
        public SurgeryPostOpResponseDto? SurgeryPostOp { get; set; }
        public SurgeryDischargeResponseDto? SurgeryDischarge { get; set; }
    }
} 