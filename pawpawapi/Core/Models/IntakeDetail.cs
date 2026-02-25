using System;
using System.Collections.Generic;

namespace Core.Models
{
    public class IntakeDetail
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public decimal? WeightKg { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public Visit? Visit { get; set; }
        public ICollection<IntakeFile>? Files { get; set; }
    }
} 