using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class EmergencyDischargeSummaryResponseDto
    {
        // Visit Information
        public Guid VisitId { get; set; }
        public Guid AppointmentId { get; set; }
        public Guid? PatientId { get; set; }
        public DateTimeOffset? VisitCreatedAt { get; set; }
        public DateTimeOffset? VisitUpdatedAt { get; set; }

        // Emergency Visit Completion Status
        public bool? IsEmergencyTriageCompleted { get; set; }
        public bool? IsEmergencyVitalCompleted { get; set; }
        public bool? IsEmergencyProcedureCompleted { get; set; }
        public bool? IsEmergencyDischargeCompleted { get; set; }

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

        // Emergency Visit Details
        public EmergencyTriageResponseDto? EmergencyTriage { get; set; }
        public EmergencyVitalResponseDto? EmergencyVitals { get; set; }
        public EmergencyProcedureResponseDto? EmergencyProcedures { get; set; }
        public EmergencyDischargeWithPrescriptionsResponseDto? EmergencyDischarges { get; set; }
    }
} 