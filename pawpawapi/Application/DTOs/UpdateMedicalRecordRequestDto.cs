using System;

namespace Application.DTOs
{
    public class UpdateMedicalRecordRequestDto
    {
        public Guid Id { get; set; }
        public Guid? ClinicId { get; set; }
        public Guid? PatientId { get; set; }
        public Guid? AppointmentId { get; set; }
        public Guid? VeterinarianId { get; set; }
        public DateTime VisitDate { get; set; }
        public string? ChiefComplaint { get; set; }
        public string? History { get; set; }
        public string? PhysicalExamFindings { get; set; }
        public string? Diagnosis { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? FollowUpInstructions { get; set; }
        public decimal? WeightKg { get; set; }
        public decimal? TemperatureCelsius { get; set; }
        public int? HeartRate { get; set; }
        public int? RespiratoryRate { get; set; }
    }
} 