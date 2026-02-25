using System;
using System.Text.Json;

namespace Core.Models
{
    public class ProcedureDetailMapping
    {
        public Guid Id { get; set; }
        public Guid ProcedureDetailId { get; set; }
        public Guid ProcedureId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public string? DocumentDetails { get; set; }
    }
} 