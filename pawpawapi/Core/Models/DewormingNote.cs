using System;

namespace Core.Models
{
    public class DewormingNote
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? AdverseReactions { get; set; }
        public string? AdditionalNotes { get; set; }
        public string? OwnerConcerns { get; set; }
        public string? ResolutionStatus { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 