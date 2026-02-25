using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class CreatePatientForRegistrationRequestDto
    {
        [Required(ErrorMessage = "Name is required")]
        [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Species is required")]
        [MaxLength(50, ErrorMessage = "Species cannot exceed 50 characters")]
        public string Species { get; set; } = string.Empty;

        [MaxLength(50, ErrorMessage = "Breed cannot exceed 50 characters")]
        public string? Breed { get; set; }

        [MaxLength(50, ErrorMessage = "Secondary breed cannot exceed 50 characters")]
        public string? SecondaryBreed { get; set; }

        [MaxLength(50, ErrorMessage = "Color cannot exceed 50 characters")]
        public string? Color { get; set; }

        [Required(ErrorMessage = "Gender is required")]
        [MaxLength(20, ErrorMessage = "Gender cannot exceed 20 characters")]
        public string Gender { get; set; }

        public bool IsNeutered { get; set; }

        public DateTimeOffset DateOfBirth { get; set; }

        public decimal? WeightKg { get; set; }

        [MaxLength(50, ErrorMessage = "Microchip number cannot exceed 50 characters")]
        public string? MicrochipNumber { get; set; }

        [MaxLength(50, ErrorMessage = "Registration number cannot exceed 50 characters")]
        public string? RegistrationNumber { get; set; }

        [MaxLength(100, ErrorMessage = "Insurance provider cannot exceed 100 characters")]
        public string? InsuranceProvider { get; set; }

        [MaxLength(100, ErrorMessage = "Insurance policy number cannot exceed 100 characters")]
        public string? InsurancePolicyNumber { get; set; }

        [MaxLength(500, ErrorMessage = "Allergies cannot exceed 500 characters")]
        public string? Allergies { get; set; }

        [MaxLength(500, ErrorMessage = "Medical conditions cannot exceed 500 characters")]
        public string? MedicalConditions { get; set; }

        [MaxLength(500, ErrorMessage = "Behavioral notes cannot exceed 500 characters")]
        public string? BehavioralNotes { get; set; }

        public bool IsActive { get; set; }
    }
}
