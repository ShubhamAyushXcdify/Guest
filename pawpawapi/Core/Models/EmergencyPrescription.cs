using System;

namespace Core.Models
{
    public class EmergencyPrescription
    {
        public Guid Id { get; set; }
        public Guid EmergencyDischargeId { get; set; }
        public Guid VisitId { get; set; }
        public string? MedicationName { get; set; }
        public string? Dose { get; set; }
        public string? Frequency { get; set; }
        public string? Duration { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 