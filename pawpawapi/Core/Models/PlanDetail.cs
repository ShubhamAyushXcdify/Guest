using System;
using System.Collections.Generic;

namespace Core.Models
{
    public class PlanDetail
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }

        public ICollection<Plan>? Plans { get; set; }
    }
} 