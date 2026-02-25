using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class DewormingCheckoutResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }

        [MaxLength(5000, ErrorMessage = "Summary cannot exceed 5000 characters")]
        public string? Summary { get; set; }

        public DateTime? NextDewormingDueDate { get; set; }

        [MaxLength(2000, ErrorMessage = "Home care instructions cannot exceed 2000 characters")]
        public string? HomeCareInstructions { get; set; }

        public bool ClientAcknowledged { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateDewormingCheckoutRequestDto
    {
        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [MaxLength(5000, ErrorMessage = "Summary cannot exceed 5000 characters")]
        public string? Summary { get; set; }

        public DateTime? NextDewormingDueDate { get; set; }

        [MaxLength(2000, ErrorMessage = "Home care instructions cannot exceed 2000 characters")]
        public string? HomeCareInstructions { get; set; }

        public bool ClientAcknowledged { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class UpdateDewormingCheckoutRequestDto
    {
        [Required]
        public Guid Id { get; set; }

        [MaxLength(5000, ErrorMessage = "Summary cannot exceed 5000 characters")]
        public string? Summary { get; set; }

        public DateTime? NextDewormingDueDate { get; set; }

        [MaxLength(2000, ErrorMessage = "Home care instructions cannot exceed 2000 characters")]
        public string? HomeCareInstructions { get; set; }

        public bool ClientAcknowledged { get; set; }
        public bool IsCompleted { get; set; }
    }
}
