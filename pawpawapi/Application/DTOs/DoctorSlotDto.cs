using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class DoctorSlotDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Day is required")]
        [StringLength(20, ErrorMessage = "Day cannot exceed 20 characters")]
        [RegularExpression(@"^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$",
            ErrorMessage = "Day must be a valid day of the week")]
        public string Day { get; set; } = string.Empty;

        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateDoctorSlotDto
    {
        [Required(ErrorMessage = "Day is required")]
        [StringLength(20, ErrorMessage = "Day cannot exceed 20 characters")]
        [RegularExpression(@"^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$",
            ErrorMessage = "Day must be a valid day of the week")]
        public string Day { get; set; } = string.Empty;

        [Required(ErrorMessage = "Start time is required")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "End time is required")]
        public TimeSpan EndTime { get; set; }
    }

    public class UpdateDoctorSlotDto
    {
        [StringLength(20, ErrorMessage = "Day cannot exceed 20 characters")]
        [RegularExpression(@"^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$",
            ErrorMessage = "Day must be a valid day of the week")]
        public string? Day { get; set; }

        public TimeSpan? StartTime { get; set; }

        public TimeSpan? EndTime { get; set; }
    }
}