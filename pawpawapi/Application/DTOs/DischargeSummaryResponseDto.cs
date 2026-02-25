using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class DischargeSummaryResponseDto
    {
        // Visit Information
        public Guid VisitId { get; set; }
        public Guid AppointmentId { get; set; }
        public Guid? PatientId { get; set; }
        public DateTimeOffset? VisitCreatedAt { get; set; }
        public DateTimeOffset? VisitUpdatedAt { get; set; }
        
        // Visit Completion Status
        public bool? IsIntakeCompleted { get; set; }
        public bool? IsComplaintsCompleted { get; set; }
        public bool? IsVitalsCompleted { get; set; }
        public bool? IsPlanCompleted { get; set; }
        public bool? IsProceduresCompleted { get; set; }
        public bool? IsPrescriptionCompleted { get; set; }
        public bool? IsVaccinationDetailCompleted { get; set; }
        
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
        
        // Visit Details
        public IntakeDetailResponseDto? IntakeDetail { get; set; }
        public ComplaintDetailResponseDto? ComplaintDetail { get; set; }
        public MedicalHistoryDetailResponseDto? MedicalHistoryDetail { get; set; }
        public VitalDetailResponseDto? VitalDetail { get; set; }
        public PlanDetailResponseDto? PlanDetail { get; set; }
        public ProcedureDetailResponseDto? ProcedureDetail { get; set; }
        public PrescriptionDetailResponseDto? PrescriptionDetail { get; set; }

    }
} 