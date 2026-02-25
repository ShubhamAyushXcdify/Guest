using System;

namespace Application.DTOs
{
    public class CreateSurgeryDischargeRequestDto
    {
        public Guid VisitId { get; set; }
        public string DischargeStatus { get; set; }
        public DateTime? DischargeDatetime { get; set; }
        public string HomeCareInstructions { get; set; }
        public string MedicationsToGoHome { get; set; }
        public string FollowUpInstructions { get; set; }
        public DateTime? FollowupDate { get; set; }
        public bool? IsCompleted { get; set; }
    }
} 