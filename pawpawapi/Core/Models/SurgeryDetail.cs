using System;

namespace Core.Models
{
    public class SurgeryDetail
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? SurgeryType { get; set; }
        public string? Surgeon { get; set; }
        public string? Anesthesiologist { get; set; }
        public DateTime? SurgeryStartTime { get; set; }
        public DateTime? SurgeryEndTime { get; set; }
        public string? AnesthesiaProtocol { get; set; }
        public string? SurgicalFindings { get; set; }
        public string? Complications { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 