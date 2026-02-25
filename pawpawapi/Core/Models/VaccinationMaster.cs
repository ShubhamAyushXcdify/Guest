using System;

namespace Core.Models
{
    public class VaccinationMaster
    {
        public Guid Id { get; set; }
        public string Species { get; set; } = string.Empty; // e.g., 'dog', 'cat'
        //public bool IsCore { get; set; } // true = core, false = non-core
        public string Disease { get; set; } = string.Empty;
        public string VaccineType { get; set; } = string.Empty;
        public string InitialDose { get; set; } = string.Empty;
        public string Booster { get; set; } = string.Empty;
        public string RevaccinationInterval { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? VacCode { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }
} 