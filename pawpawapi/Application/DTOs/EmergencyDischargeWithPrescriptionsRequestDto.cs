using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class EmergencyDischargeWithPrescriptionsRequestDto
    {
        public Guid? Id { get; set; } 
        public Guid VisitId { get; set; }
        public string? DischargeStatus { get; set; }
        public DateTime? DischargeTime { get; set; }
        public string? ResponsibleClinician { get; set; }
        public string? DischargeSummary { get; set; }
        public string? HomeCareInstructions { get; set; }
        public string? FollowupInstructions { get; set; }
        public DateTime? FollowupDate { get; set; }
        public bool? ReviewedWithClient { get; set; }
        public bool? IsCompleted { get; set; }
    }
} 