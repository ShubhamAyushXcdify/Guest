using System;
using System.Collections.Generic;

namespace Core.Models
{
    public class ComplaintDetail
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }

        public ICollection<Symptom>? Symptoms { get; set; }
    }
} 