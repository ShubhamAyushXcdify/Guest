using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class ClientDischargeSummaryResponseDto
    {
        // Appointment Information
        public Guid AppointmentId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? AppointmentType { get; set; }
        public string? Status { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
        
        // Visit Information
        public Guid VisitId { get; set; }
        public DateTimeOffset? VisitCreatedAt { get; set; }
        public DateTimeOffset? VisitUpdatedAt { get; set; }
        
        // Patient Information
        public Guid? PatientId { get; set; }
        public string? PatientName { get; set; }
        
        // Veterinarian Information
        public Guid? VeterinarianId { get; set; }
        public string? VeterinarianName { get; set; }
        
        // Clinic Information
        public Guid? ClinicId { get; set; }
        public string? ClinicName { get; set; }
        
        // Room Information
        public Guid? RoomId { get; set; }
        public string? RoomName { get; set; }
        
        // Visit Completion Status
        public bool? IsIntakeCompleted { get; set; }
        public bool? IsComplaintsCompleted { get; set; }
        public bool? IsVitalsCompleted { get; set; }
        public bool? IsPlanCompleted { get; set; }
        public bool? IsProceduresCompleted { get; set; }
        public bool? IsPrescriptionCompleted { get; set; }
        public bool? IsVaccinationDetailCompleted { get; set; }
        
        // Emergency Visit Status
        public bool? IsEmergencyTriageCompleted { get; set; }
        public bool? IsEmergencyVitalCompleted { get; set; }
        public bool? IsEmergencyProcedureCompleted { get; set; }
        public bool? IsEmergencyDischargeCompleted { get; set; }
        
        // Surgery Visit Status
        public bool? IsSurgeryPreOpCompleted { get; set; }
        public bool? IsSurgeryDetailsCompleted { get; set; }
        public bool? IsSurgeryPostOpCompleted { get; set; }
        public bool? IsSurgeryDischargeCompleted { get; set; }
        
        // Deworming Visit Status
        public bool? IsDewormingIntakeCompleted { get; set; }
        public bool? IsDewormingMedicationCompleted { get; set; }
        public bool? IsDewormingNotesCompleted { get; set; }
        public bool? IsDewormingCheckoutCompleted { get; set; }
        
        // Vaccination Visit Status
        public bool? IsVaccinationCompleted { get; set; }
        
        // Visit Details (based on appointment type)
        public IntakeDetailResponseDto? IntakeDetail { get; set; }
        public ComplaintDetailResponseDto? ComplaintDetail { get; set; }
        public MedicalHistoryDetailResponseDto? MedicalHistoryDetail { get; set; }
        public VitalDetailResponseDto? VitalDetail { get; set; }
        public PlanDetailResponseDto? PlanDetail { get; set; }
        public ProcedureDetailResponseDto? ProcedureDetail { get; set; }
        public PrescriptionDetailResponseDto? PrescriptionDetail { get; set; }
        
        // Emergency Visit Details
        public EmergencyTriageResponseDto? EmergencyTriage { get; set; }
        public EmergencyVitalResponseDto? EmergencyVitals { get; set; }
        public EmergencyProcedureResponseDto? EmergencyProcedures { get; set; }
        public EmergencyDischargeWithPrescriptionsResponseDto? EmergencyDischarges { get; set; }
        
        // Surgery Visit Details
        public SurgeryPreOpResponseDto? SurgeryPreOp { get; set; }
        public SurgeryDetailResponseDto? SurgeryDetail { get; set; }
        public SurgeryPostOpResponseDto? SurgeryPostOp { get; set; }
        public SurgeryDischargeResponseDto? SurgeryDischarge { get; set; }
        
        // Deworming Visit Details
        public DewormingIntakeResponseDto? DewormingIntake { get; set; }
        public DewormingMedicationResponseDto? DewormingMedication { get; set; }
        public DewormingNoteResponseDto? DewormingNote { get; set; }
        public DewormingCheckoutResponseDto? DewormingCheckout { get; set; }
        
        // Vaccination Visit Details
        public List<VaccinationDetailWithMastersResponseDto> VaccinationDetails { get; set; } = new();
    }
} 