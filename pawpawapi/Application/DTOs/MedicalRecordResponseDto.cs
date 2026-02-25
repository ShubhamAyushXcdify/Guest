using System;

namespace Application.DTOs
{
    public class MedicalRecordResponseDto
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
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        // Navigation properties
        public ClinicResponseDto? Clinic { get; set; }
        public PatientResponseDto? Patient { get; set; }
        public AppointmentResponseDto? Appointment { get; set; }
        public UserResponseDto? Veterinarian { get; set; }
    }
} 