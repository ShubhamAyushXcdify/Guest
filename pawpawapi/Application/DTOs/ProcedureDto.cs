using System;

namespace Application.DTOs
{
    public class ProcedureDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Notes { get; set; }
        public string? Type { get; set; }
        public string? ProcCode { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    public class ProcedureResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? Type { get; set; }
        public string? ProcCode { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    public class CreateProcedureRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? Type { get; set; }
        public string? ProcCode { get; set; }
    }

    public class UpdateProcedureRequestDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? Type { get; set; }
        public string? ProcCode { get; set; }
    }
} 