using System;

namespace Application.DTOs
{
    public class DewormingDischargeSummaryResponseDto
    {
        // Visit Information
        public Guid VisitId { get; set; }
        public Guid AppointmentId { get; set; }
        public Guid? PatientId { get; set; }
        public DateTimeOffset? VisitCreatedAt { get; set; }
        public DateTimeOffset? VisitUpdatedAt { get; set; }

        // Deworming Visit Completion Status
        public bool? IsDewormingIntakeCompleted { get; set; }
        public bool? IsDewormingMedicationCompleted { get; set; }
        public bool? IsDewormingNotesCompleted { get; set; }
        public bool? IsDewormingCheckoutCompleted { get; set; }

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

        // Deworming Visit Details
        public DewormingIntakeResponseDto? DewormingIntake { get; set; }
        public DewormingMedicationResponseDto? DewormingMedication { get; set; }
        public DewormingNoteResponseDto? DewormingNote { get; set; }
        public DewormingCheckoutResponseDto? DewormingCheckout { get; set; }
    }
} 