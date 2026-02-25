using System;

namespace Core.Models
{
    public class SurgeryPreOp
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public decimal? WeightKg { get; set; }
        public string? PreOpBloodworkResults { get; set; }
        public string? AnesthesiaRiskAssessment { get; set; }
        public string? FastingStatus { get; set; }
        public string? PreOpMedications { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 