using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class ProcedureDetailResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsCompleted { get; set; }
        public ICollection<ProcedureDto>? Procedures { get; set; }
    }

    public class CreateProcedureDetailRequestDto
    {
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public ICollection<Guid>? ProcedureIds { get; set; }
    }

    public class UpdateProcedureDetailRequestDto
    {
        public Guid Id { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public ICollection<Guid>? ProcedureIds { get; set; }
    }

} 