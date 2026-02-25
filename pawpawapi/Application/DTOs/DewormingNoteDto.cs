using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class DewormingNoteResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }

        [MaxLength(2000, ErrorMessage = "Adverse reactions cannot exceed 2000 characters")]
        public string? AdverseReactions { get; set; }

        [MaxLength(5000, ErrorMessage = "Additional notes cannot exceed 5000 characters")]
        public string? AdditionalNotes { get; set; }

        [MaxLength(2000, ErrorMessage = "Owner concerns cannot exceed 2000 characters")]
        public string? OwnerConcerns { get; set; }

        [MaxLength(200, ErrorMessage = "Resolution status cannot exceed 200 characters")]
        public string? ResolutionStatus { get; set; }

        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateDewormingNoteRequestDto
    {
        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [MaxLength(2000, ErrorMessage = "Adverse reactions cannot exceed 2000 characters")]
        public string? AdverseReactions { get; set; }

        [MaxLength(5000, ErrorMessage = "Additional notes cannot exceed 5000 characters")]
        public string? AdditionalNotes { get; set; }

        [MaxLength(2000, ErrorMessage = "Owner concerns cannot exceed 2000 characters")]
        public string? OwnerConcerns { get; set; }

        [MaxLength(200, ErrorMessage = "Resolution status cannot exceed 200 characters")]
        public string? ResolutionStatus { get; set; }

        public bool IsCompleted { get; set; }
    }

    public class UpdateDewormingNoteRequestDto
    {
        [Required]
        public Guid Id { get; set; }

        [MaxLength(2000, ErrorMessage = "Adverse reactions cannot exceed 2000 characters")]
        public string? AdverseReactions { get; set; }

        [MaxLength(5000, ErrorMessage = "Additional notes cannot exceed 5000 characters")]
        public string? AdditionalNotes { get; set; }

        [MaxLength(2000, ErrorMessage = "Owner concerns cannot exceed 2000 characters")]
        public string? OwnerConcerns { get; set; }

        [MaxLength(200, ErrorMessage = "Resolution status cannot exceed 200 characters")]
        public string? ResolutionStatus { get; set; }

        public bool IsCompleted { get; set; }
    }
}
