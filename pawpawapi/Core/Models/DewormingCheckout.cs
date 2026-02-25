using System;

namespace Core.Models
{
    public class DewormingCheckout
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? Summary { get; set; }
        public DateTime? NextDewormingDueDate { get; set; }
        public string? HomeCareInstructions { get; set; }
        public bool ClientAcknowledged { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 