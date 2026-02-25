using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class EmergencyDischargeResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? DischargeStatus { get; set; }
        public DateTime? DischargeTime { get; set; }
        public string? ResponsibleClinician { get; set; }
        public string? DischargeSummary { get; set; }
        public string? HomeCareInstructions { get; set; }
        public string? FollowupInstructions { get; set; }
        public DateTime? NextAppointmentDate { get; set; }
        public DateTime? FollowupDate { get; set; }
        public bool? ReviewedWithClient { get; set; }
        public bool? IsCompleted { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateEmergencyDischargeRequestDto
    {
        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [StringLength(50, ErrorMessage = "Discharge status cannot exceed 50 characters")]
        [RegularExpression(@"^(Discharged|Transferred|Deceased|Against Medical Advice)$",
            ErrorMessage = "Discharge status must be: Discharged, Transferred, Deceased, or Against Medical Advice")]
        public string? DischargeStatus { get; set; }

        public DateTime? DischargeTime { get; set; }

        [StringLength(200, ErrorMessage = "Responsible clinician name cannot exceed 200 characters")]
        public string? ResponsibleClinician { get; set; }

        [StringLength(2000, ErrorMessage = "Discharge summary cannot exceed 2000 characters")]
        public string? DischargeSummary { get; set; }

        [StringLength(1000, ErrorMessage = "Home care instructions cannot exceed 1000 characters")]
        public string? HomeCareInstructions { get; set; }

        [StringLength(1000, ErrorMessage = "Follow-up instructions cannot exceed 1000 characters")]
        public string? FollowupInstructions { get; set; }

        public DateTime? NextAppointmentDate { get; set; }

        public DateTime? FollowupDate { get; set; }

        public bool? ReviewedWithClient { get; set; }

        public bool? IsCompleted { get; set; } = false;
  
    }

    public class UpdateEmergencyDischargeRequestDto
    {
        [Required(ErrorMessage = "ID is required")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [StringLength(50, ErrorMessage = "Discharge status cannot exceed 50 characters")]
        [RegularExpression(@"^(Discharged|Transferred|Deceased|Against Medical Advice)$", 
            ErrorMessage = "Discharge status must be: Discharged, Transferred, Deceased, or Against Medical Advice")]
        public string? DischargeStatus { get; set; }

        public DateTime? DischargeTime { get; set; }

        [StringLength(200, ErrorMessage = "Responsible clinician name cannot exceed 200 characters")]
        public string? ResponsibleClinician { get; set; }

        [StringLength(2000, ErrorMessage = "Discharge summary cannot exceed 2000 characters")]
        public string? DischargeSummary { get; set; }

        [StringLength(1000, ErrorMessage = "Home care instructions cannot exceed 1000 characters")]
        public string? HomeCareInstructions { get; set; }

        [StringLength(1000, ErrorMessage = "Follow-up instructions cannot exceed 1000 characters")]
        public string? FollowupInstructions { get; set; }

        public DateTime? NextAppointmentDate { get; set; }

        public DateTime? FollowupDate { get; set; }

        public bool? ReviewedWithClient { get; set; }

        public bool? IsCompleted { get; set; }

    }
}
