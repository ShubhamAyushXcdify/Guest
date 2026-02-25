using System;

namespace Application.DTOs
{
    public class PlanDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Notes { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    public class PlanResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    public class CreatePlanRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class UpdatePlanRequestDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
} 