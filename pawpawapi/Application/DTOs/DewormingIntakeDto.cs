
using System;
using System.ComponentModel.DataAnnotations;
 
namespace Application.DTOs
{
    public class DewormingIntakeResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }

        [Range(0, 1000, ErrorMessage = "Weight must be between 0 and 1000 kg")]
        public decimal? WeightKg { get; set; }

        public DateTime? LastDewormingDate { get; set; }

        [MaxLength(2000, ErrorMessage = "Symptoms notes cannot exceed 2000 characters")]
        public string? SymptomsNotes { get; set; }

        public decimal? TemperatureC { get; set; }

        [MaxLength(2000, ErrorMessage = "Appetite feeding notes cannot exceed 2000 characters")]
        public string? AppetiteFeedingNotes { get; set; }

        [MaxLength(2000, ErrorMessage = "Current medications cannot exceed 2000 characters")]
        public string? CurrentMedications { get; set; }

        public bool IsStoolSampleCollected { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateDewormingIntakeRequestDto
    {
        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [Range(0, 1000, ErrorMessage = "Weight must be between 0 and 1000 kg")]
        public decimal? WeightKg { get; set; }

        public DateTime? LastDewormingDate { get; set; }

        [MaxLength(2000, ErrorMessage = "Symptoms notes cannot exceed 2000 characters")]
        public string? SymptomsNotes { get; set; }

        public decimal? TemperatureC { get; set; }

        [MaxLength(2000, ErrorMessage = "Appetite feeding notes cannot exceed 2000 characters")]
        public string? AppetiteFeedingNotes { get; set; }

        [MaxLength(2000, ErrorMessage = "Current medications cannot exceed 2000 characters")]
        public string? CurrentMedications { get; set; }

        public bool IsStoolSampleCollected { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class UpdateDewormingIntakeRequestDto
    {
        [Required]
        public Guid Id { get; set; }

        [Range(0, 1000, ErrorMessage = "Weight must be between 0 and 1000 kg")]
        public decimal? WeightKg { get; set; }

        public DateTime? LastDewormingDate { get; set; }

        [MaxLength(2000, ErrorMessage = "Symptoms notes cannot exceed 2000 characters")]
        public string? SymptomsNotes { get; set; }

        public decimal? TemperatureC { get; set; }

        [MaxLength(2000, ErrorMessage = "Appetite feeding notes cannot exceed 2000 characters")]
        public string? AppetiteFeedingNotes { get; set; }

        [MaxLength(2000, ErrorMessage = "Current medications cannot exceed 2000 characters")]
        public string? CurrentMedications { get; set; }

        public bool IsStoolSampleCollected { get; set; }
        public bool IsCompleted { get; set; }
    }
}