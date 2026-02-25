using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class EmergencyTriageResponseDto
    {
        public Guid Id { get; set; }
        public DateTime ArrivalTime { get; set; }
        public string? TriageNurseDoctor { get; set; }
        public string? TriageCategory { get; set; }
        public int? PainScore { get; set; }
        public string? Allergies { get; set; }
        public bool? ImmediateInterventionRequired { get; set; }
        public string? ReasonForEmergency { get; set; }
        public string? TriageLevel { get; set; }
        public string? PresentingComplaint { get; set; }
        public string? InitialNotes { get; set; }
        public bool? IsComplete { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? VisitId { get; set; }
    }

    public class CreateEmergencyTriageRequestDto
    {
        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [Required(ErrorMessage = "Arrival time is required")]
        public DateTime ArrivalTime { get; set; }

        [StringLength(100, ErrorMessage = "Triage nurse/doctor name cannot exceed 100 characters")]
        public string? TriageNurseDoctor { get; set; }

        [StringLength(50, ErrorMessage = "Triage category cannot exceed 50 characters")]
        [RegularExpression(@"^(Critical|High|Medium|Low)$", ErrorMessage = "Triage category must be Critical, High, Medium, or Low")]
        public string? TriageCategory { get; set; }

        [Range(0, 10, ErrorMessage = "Pain score must be between 0 and 10")]
        public int? PainScore { get; set; }

        [StringLength(500, ErrorMessage = "Allergies cannot exceed 500 characters")]
        public string? Allergies { get; set; }

        public bool? ImmediateInterventionRequired { get; set; }

        [StringLength(1000, ErrorMessage = "Reason for emergency cannot exceed 1000 characters")]
        public string? ReasonForEmergency { get; set; }

        [StringLength(50, ErrorMessage = "Triage level cannot exceed 50 characters")]
        [RegularExpression(@"^(Level 1|Level 2|Level 3|Level 4|Level 5)$", ErrorMessage = "Triage level must be Level 1-5")]
        public string? TriageLevel { get; set; }

        [StringLength(1000, ErrorMessage = "Presenting complaint cannot exceed 1000 characters")]
        public string? PresentingComplaint { get; set; }

        [StringLength(2000, ErrorMessage = "Initial notes cannot exceed 2000 characters")]
        public string? InitialNotes { get; set; }

        public bool? IsComplete { get; set; } = false;
    }

    public class UpdateEmergencyTriageRequestDto
    {
        [Required(ErrorMessage = "ID is required")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [Required(ErrorMessage = "Arrival time is required")]
        public DateTime ArrivalTime { get; set; }

        [StringLength(100, ErrorMessage = "Triage nurse/doctor name cannot exceed 100 characters")]
        public string? TriageNurseDoctor { get; set; }

        [StringLength(50, ErrorMessage = "Triage category cannot exceed 50 characters")]
        [RegularExpression(@"^(Critical|High|Medium|Low)$", ErrorMessage = "Triage category must be Critical, High, Medium, or Low")]
        public string? TriageCategory { get; set; }

        [Range(0, 10, ErrorMessage = "Pain score must be between 0 and 10")]
        public int? PainScore { get; set; }

        [StringLength(500, ErrorMessage = "Allergies cannot exceed 500 characters")]
        public string? Allergies { get; set; }

        public bool? ImmediateInterventionRequired { get; set; }

        [StringLength(1000, ErrorMessage = "Reason for emergency cannot exceed 1000 characters")]
        public string? ReasonForEmergency { get; set; }

        [StringLength(50, ErrorMessage = "Triage level cannot exceed 50 characters")]
        [RegularExpression(@"^(Level 1|Level 2|Level 3|Level 4|Level 5)$", ErrorMessage = "Triage level must be Level 1-5")]
        public string? TriageLevel { get; set; }

        [StringLength(1000, ErrorMessage = "Presenting complaint cannot exceed 1000 characters")]
        public string? PresentingComplaint { get; set; }

        [StringLength(2000, ErrorMessage = "Initial notes cannot exceed 2000 characters")]
        public string? InitialNotes { get; set; }

        public bool? IsComplete { get; set; }
    }
}
