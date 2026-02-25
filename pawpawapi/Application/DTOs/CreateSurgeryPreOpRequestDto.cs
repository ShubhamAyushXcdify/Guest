using System;

namespace Application.DTOs
{
    public class CreateSurgeryPreOpRequestDto
    {
        public Guid VisitId { get; set; }
        public decimal? WeightKg { get; set; }
        public string? PreOpBloodworkResults { get; set; }
        public string? AnesthesiaRiskAssessment { get; set; }
        public string? FastingStatus { get; set; }
        public string? PreOpMedications { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
    }
} 