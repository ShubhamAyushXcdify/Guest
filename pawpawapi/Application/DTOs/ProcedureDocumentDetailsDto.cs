using System;
using System.Text.Json;

namespace Application.DTOs
{
    public class ProcedureDocumentDetailsResponseDto
    {
        public Guid Id { get; set; }
        public Guid ProcedureDetailId { get; set; }
        public Guid ProcedureId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public string? DocumentDetails { get; set; }
    }

    public class CreateProcedureDocumentDetailsRequestDto
    {
        public Guid VisitId { get; set; }
        public Guid ProcedureId { get; set; }
        public string? DocumentDetails { get; set; }
    }

    public class UpdateProcedureDocumentDetailsRequestDto
    {
        public Guid Id { get; set; }
        public string? DocumentDetails { get; set; }
    }

    public class GetProcedureDocumentDetailsRequestDto
    {
        public Guid VisitId { get; set; }
        public Guid ProcedureId { get; set; }
    }
} 