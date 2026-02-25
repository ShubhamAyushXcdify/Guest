using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class PlanDetailResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public ICollection<PlanDto>? Plans { get; set; }
    }

    public class CreatePlanDetailRequestDto
    {
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public ICollection<Guid>? PlanIds { get; set; }
    }

    public class UpdatePlanDetailRequestDto
    {
        public Guid Id { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public ICollection<Guid>? PlanIds { get; set; }
    }
} 