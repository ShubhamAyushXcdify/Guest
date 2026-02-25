using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class EmergencyPrescriptionResponseDto
    {
        public Guid Id { get; set; }
        public Guid EmergencyDischargeId { get; set; }
        public Guid VisitId { get; set; }
        public string? MedicationName { get; set; }
        public string? Dose { get; set; }
        public string? Frequency { get; set; }
        public string? Duration { get; set; }
        public bool? IsCompleted { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateEmergencyPrescriptionRequestDto
    {
        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [Required(ErrorMessage = "Medication name is required")]
        [StringLength(200, ErrorMessage = "Medication name cannot exceed 200 characters")]
        public string? MedicationName { get; set; }

        [Required(ErrorMessage = "Dose is required")]
        [StringLength(100, ErrorMessage = "Dose cannot exceed 100 characters")]
        public string? Dose { get; set; }

        [Required(ErrorMessage = "Frequency is required")]
        [StringLength(100, ErrorMessage = "Frequency cannot exceed 100 characters")]
        public string? Frequency { get; set; }

        [Required(ErrorMessage = "Duration is required")]
        [StringLength(100, ErrorMessage = "Duration cannot exceed 100 characters")]
        public string? Duration { get; set; }

        public bool? IsCompleted { get; set; } = false;
    }

    public class UpdateEmergencyPrescriptionRequestDto
    {
        [Required(ErrorMessage = "ID is required")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Emergency discharge ID is required")]
        public Guid EmergencyDischargeId { get; set; }

        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [Required(ErrorMessage = "Medication name is required")]
        [StringLength(200, ErrorMessage = "Medication name cannot exceed 200 characters")]
        public string? MedicationName { get; set; }

        [Required(ErrorMessage = "Dose is required")]
        [StringLength(100, ErrorMessage = "Dose cannot exceed 100 characters")]
        public string? Dose { get; set; }

        [Required(ErrorMessage = "Frequency is required")]
        [StringLength(100, ErrorMessage = "Frequency cannot exceed 100 characters")]
        public string? Frequency { get; set; }

        [Required(ErrorMessage = "Duration is required")]
        [StringLength(100, ErrorMessage = "Duration cannot exceed 100 characters")]
        public string? Duration { get; set; }

        public bool? IsCompleted { get; set; }
    }
}
