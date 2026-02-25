using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class EmergencyProcedureMedicationDto
    {
        public Guid? Id { get; set; }

        [Required(ErrorMessage = "Medication name is required")]
        [StringLength(200, ErrorMessage = "Medication name cannot exceed 200 characters")]
        public string? Name { get; set; }

        [Required(ErrorMessage = "Dose is required")]
        [StringLength(100, ErrorMessage = "Dose cannot exceed 100 characters")]
        public string? Dose { get; set; }

        [StringLength(50, ErrorMessage = "Route cannot exceed 50 characters")]
        [RegularExpression(@"^(Oral|IV|IM|SC|Topical|Inhalation|Rectal|Other)$",
            ErrorMessage = "Route must be: Oral, IV, IM, SC, Topical, Inhalation, Rectal, or Other")]
        public string? Route { get; set; }

        public TimeSpan? Time { get; set; }
    }
}