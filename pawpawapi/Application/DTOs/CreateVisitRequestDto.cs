using System;

namespace Application.DTOs
{
    public class CreateVisitRequestDto
    {
        public Guid AppointmentId { get; set; }
        public Guid? PatientId { get; set; }
        public bool? IsIntakeCompleted { get; set; }
        public bool? IsComplaintsCompleted { get; set; }
        public bool? IsVitalsCompleted { get; set; }
        public bool? IsPlanCompleted { get; set; }
        public bool? IsProceduresCompleted { get; set; }
        public bool? IsPrescriptionCompleted { get; set; }
        public bool? IsVaccinationDetailCompleted { get; set; }
        public bool? IsEmergencyTriageCompleted { get; set; }
        public bool? IsEmergencyVitalCompleted { get; set; }
        public bool? IsEmergencyProcedureCompleted { get; set; }
        public bool? IsEmergencyDischargeCompleted { get; set; }
        public bool? IsSurgeryPreOpCompleted { get; set; }
        public bool? IsSurgeryDetailsCompleted { get; set; }
        public bool? IsSurgeryPostOpCompleted { get; set; }
        public bool? IsSurgeryDischargeCompleted { get; set; }
        public bool? IsDewormingIntakeCompleted { get; set; }
        public bool? IsDewormingMedicationCompleted { get; set; }
        public bool? IsDewormingNotesCompleted { get; set; }
        public bool? IsDewormingCheckoutCompleted { get; set; }
    }
} 