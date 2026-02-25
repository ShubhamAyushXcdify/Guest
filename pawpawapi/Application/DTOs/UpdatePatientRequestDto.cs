using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class UpdatePatientRequestDto
    {
        public Guid Id { get; set; }
        public Guid? ClientId { get; set; }
        public Guid CompanyId { get; set; }
        public string Name { get; set; }
        public string Species { get; set; }
        public string? Breed { get; set; }
        public string? SecondaryBreed { get; set; }
        public string? Color { get; set; }
        public string? Gender { get; set; }
        public bool? IsNeutered { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public decimal? WeightKg { get; set; }
        
        [Required(ErrorMessage = "Microchip number is required")]
        [MaxLength(50, ErrorMessage = "Microchip number cannot exceed 50 characters")]
        public string MicrochipNumber { get; set; }
        
        public string? RegistrationNumber { get; set; }
        public string? InsuranceProvider { get; set; }
        public string? InsurancePolicyNumber { get; set; }
        public string? Allergies { get; set; }
        public string? MedicalConditions { get; set; }
        public string? BehavioralNotes { get; set; }
        public bool? IsActive { get; set; }
    }
} 