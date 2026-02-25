using System;

namespace Application.DTOs
{

     public class SymptomDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? notes { get; set; } // Assuming Description is a field in your Symptom model/table
        public bool IsComman { get; set; }
        public string? Breed { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }
    public class SymptomResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool IsComman { get; set; }
        public string? Breed { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    public class CreateSymptomRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool IsComman { get; set; } = false;
        public string? Breed { get; set; }
    }

    public class UpdateSymptomRequestDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool IsComman { get; set; }
        public string? Breed { get; set; }
    }
} 