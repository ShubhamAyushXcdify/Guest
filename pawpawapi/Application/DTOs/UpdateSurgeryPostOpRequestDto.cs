using System;

namespace Application.DTOs
{
    public class UpdateSurgeryPostOpRequestDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string RecoveryStatus { get; set; }
        public string PainAssessment { get; set; }
        public string VitalSigns { get; set; }
        public string PostOpMedications { get; set; }
        public string WoundCare { get; set; }
        public string Notes { get; set; }
        public bool? IsCompleted { get; set; }
    }
} 