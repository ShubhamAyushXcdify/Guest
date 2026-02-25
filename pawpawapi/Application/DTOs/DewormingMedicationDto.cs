using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class DewormingMedicationResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }

        [MaxLength(100, ErrorMessage = "Route cannot exceed 100 characters")]
        public string? Route { get; set; }

        public DateTime? DateTimeGiven { get; set; }

        [MaxLength(200, ErrorMessage = "Veterinarian name cannot exceed 200 characters")]
        public string? VeterinarianName { get; set; }

        [MaxLength(200, ErrorMessage = "Administered by cannot exceed 200 characters")]
        public string? AdministeredBy { get; set; }

        [MaxLength(2000, ErrorMessage = "Remarks cannot exceed 2000 characters")]
        public string? Remarks { get; set; }

        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateDewormingMedicationRequestDto
    {
        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [MaxLength(100, ErrorMessage = "Route cannot exceed 100 characters")]
        public string? Route { get; set; }

        public DateTime? DateTimeGiven { get; set; }

        [MaxLength(200, ErrorMessage = "Veterinarian name cannot exceed 200 characters")]
        public string? VeterinarianName { get; set; }

        [MaxLength(200, ErrorMessage = "Administered by cannot exceed 200 characters")]
        public string? AdministeredBy { get; set; }

        [MaxLength(2000, ErrorMessage = "Remarks cannot exceed 2000 characters")]
        public string? Remarks { get; set; }

        public bool IsCompleted { get; set; }
    }

    public class UpdateDewormingMedicationRequestDto
    {
        [Required]
        public Guid Id { get; set; }

        [MaxLength(100, ErrorMessage = "Route cannot exceed 100 characters")]
        public string? Route { get; set; }

        public DateTime? DateTimeGiven { get; set; }

        [MaxLength(200, ErrorMessage = "Veterinarian name cannot exceed 200 characters")]
        public string? VeterinarianName { get; set; }

        [MaxLength(200, ErrorMessage = "Administered by cannot exceed 200 characters")]
        public string? AdministeredBy { get; set; }

        [MaxLength(2000, ErrorMessage = "Remarks cannot exceed 2000 characters")]
        public string? Remarks { get; set; }

        public bool IsCompleted { get; set; }
    }
}
