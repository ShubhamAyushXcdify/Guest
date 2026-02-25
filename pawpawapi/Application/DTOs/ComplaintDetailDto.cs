using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class ComplaintDetailResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public ICollection<SymptomDto>? Symptoms { get; set; }
    }

    public class CreateComplaintDetailRequestDto
    {
        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [MaxLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters")]
        public string? Notes { get; set; }

        public bool IsCompleted { get; set; }

        public ICollection<Guid>? SymptomIds { get; set; }
    }

    public class UpdateComplaintDetailRequestDto
    {
        [Required]
        public Guid Id { get; set; }

        [MaxLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters")]
        public string? Notes { get; set; }

        public bool IsCompleted { get; set; }

        public ICollection<Guid>? SymptomIds { get; set; }
    }
}