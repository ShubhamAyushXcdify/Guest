using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class PatientAppointmentHistoryResponseDto
    {
        public Guid PatientId { get; set; }
        public string? PatientName { get; set; }
        public List<AppointmentHistoryItemDto> AppointmentHistory { get; set; } = new List<AppointmentHistoryItemDto>();
    }

    public class AppointmentHistoryItemDto
    {
        public Guid AppointmentId { get; set; }
        public Guid? VisitId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan? AppointmentTimeFrom { get; set; }
        public TimeSpan? AppointmentTimeTo { get; set; }
        public string? AppointmentType { get; set; }
        public string? Status { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
        public bool IsRegistered { get; set; }
        public Guid? VeterinarianId { get; set; }
        public string? VeterinarianName { get; set; }
        public Guid? ClinicId { get; set; }
        public string? ClinicName { get; set; }
        public Guid? RoomId { get; set; }
        public string? RoomName { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        
        // Visit Details (populated when appointment type is "consultation")
        public IntakeDetailResponseDto? IntakeDetail { get; set; }
        public VitalDetailResponseDto? VitalDetail { get; set; }
        public ComplaintDetailResponseDto? ComplaintDetail { get; set; }
        public ProcedureDetailResponseDto? ProcedureDetail { get; set; }
        public PrescriptionDetailResponseDto? PrescriptionDetail { get; set; }
        public PlanDetailResponseDto? PlanDetail { get; set; }
        public SurgeryDetailResponseDto? SurgeryDetail { get; set; }
        public SurgeryDischargeResponseDto? SurgeryDischarge { get; set; }
        public SurgeryPostOpResponseDto? SurgeryPostOp { get; set; }
        public SurgeryPreOpResponseDto? SurgeryPreOp { get; set; }
        public List<DewormingCheckoutResponseDto>? DewormingCheckout { get; set; }
        public DewormingIntakeResponseDto? DewormingIntake { get; set; }
        public List<DewormingMedicationResponseDto>? DewormingMedication { get; set; }
        public List<DewormingNoteResponseDto>? DewormingNotes { get; set; }
        public EmergencyDischargeResponseDto EmergencyDischarge { get; set; }
        public EmergencyProcedureResponseDto? EmergencyProcedure { get; set; }
        public EmergencyTriageResponseDto? EmergencyTriage { get; set; }
        public EmergencyVitalResponseDto? EmergencyVital { get; set; }
        public CertificateResponseDto? Certificate { get; set; }
        public List<VaccinationDetailResponseDto>? VaccinationDetail { get; set; }




    }
}

