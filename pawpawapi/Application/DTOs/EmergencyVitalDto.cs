using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class EmergencyVitalResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public decimal? WeightKg { get; set; }
        public decimal? CapillaryRefillTimeSec { get; set; }
        public string? MucousMembraneColor { get; set; }
        public decimal? OxygenSaturationSpo2 { get; set; }
        public decimal? BloodGlucoseMgDl { get; set; }
        public decimal? TemperatureC { get; set; }
        public string? HeartRhythm { get; set; }
        public int? HeartRateBpm { get; set; }
        public int? RespiratoryRateBpm { get; set; }
        public string? BloodPressure { get; set; }
        public bool? SupplementalOxygenGiven { get; set; }
        public string? Notes { get; set; }
        public bool? IsCompleted { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateEmergencyVitalRequestDto
    {
        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [Range(0.1, 1000, ErrorMessage = "Weight must be between 0.1 and 1000 kg")]
        public decimal? WeightKg { get; set; }

        [Range(0, 10, ErrorMessage = "Capillary refill time must be between 0 and 10 seconds")]
        public decimal? CapillaryRefillTimeSec { get; set; }

        [StringLength(50, ErrorMessage = "Mucous membrane color cannot exceed 50 characters")]
        public string? MucousMembraneColor { get; set; }

        [Range(70, 100, ErrorMessage = "Oxygen saturation must be between 70% and 100%")]
        public decimal? OxygenSaturationSpo2 { get; set; }

        [Range(20, 800, ErrorMessage = "Blood glucose must be between 20 and 800 mg/dL")]
        public decimal? BloodGlucoseMgDl { get; set; }

        [Range(32, 43, ErrorMessage = "Temperature must be between 32°C and 43°C")]
        public decimal? TemperatureC { get; set; }

        [StringLength(100, ErrorMessage = "Heart rhythm cannot exceed 100 characters")]
        public string? HeartRhythm { get; set; }

        [Range(30, 300, ErrorMessage = "Heart rate must be between 30 and 300 BPM")]
        public int? HeartRateBpm { get; set; }

        [Range(5, 60, ErrorMessage = "Respiratory rate must be between 5 and 60 breaths per minute")]
        public int? RespiratoryRateBpm { get; set; }

        [StringLength(20, ErrorMessage = "Blood pressure cannot exceed 20 characters")]
        [RegularExpression(@"^\d{2,3}\/\d{2,3}$", ErrorMessage = "Blood pressure must be in format XXX/XXX")]
        public string? BloodPressure { get; set; }

        public bool? SupplementalOxygenGiven { get; set; }

        [StringLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters")]
        public string? Notes { get; set; }

        public bool? IsCompleted { get; set; } = false;
    }

    public class UpdateEmergencyVitalRequestDto
    {
        [Required(ErrorMessage = "ID is required")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [Range(0.1, 1000, ErrorMessage = "Weight must be between 0.1 and 1000 kg")]
        public decimal? WeightKg { get; set; }

        [Range(0, 10, ErrorMessage = "Capillary refill time must be between 0 and 10 seconds")]
        public decimal? CapillaryRefillTimeSec { get; set; }

        [StringLength(50, ErrorMessage = "Mucous membrane color cannot exceed 50 characters")]
        public string? MucousMembraneColor { get; set; }

        [Range(70, 100, ErrorMessage = "Oxygen saturation must be between 70% and 100%")]
        public decimal? OxygenSaturationSpo2 { get; set; }

        [Range(20, 800, ErrorMessage = "Blood glucose must be between 20 and 800 mg/dL")]
        public decimal? BloodGlucoseMgDl { get; set; }

        [Range(32, 43, ErrorMessage = "Temperature must be between 32°C and 43°C")]
        public decimal? TemperatureC { get; set; }

        [StringLength(100, ErrorMessage = "Heart rhythm cannot exceed 100 characters")]
        public string? HeartRhythm { get; set; }

        [Range(30, 300, ErrorMessage = "Heart rate must be between 30 and 300 BPM")]
        public int? HeartRateBpm { get; set; }

        [Range(5, 60, ErrorMessage = "Respiratory rate must be between 5 and 60 breaths per minute")]
        public int? RespiratoryRateBpm { get; set; }

        [StringLength(20, ErrorMessage = "Blood pressure cannot exceed 20 characters")]
        [RegularExpression(@"^\d{2,3}\/\d{2,3}$", ErrorMessage = "Blood pressure must be in format XXX/XXX")]
        public string? BloodPressure { get; set; }

        public bool? SupplementalOxygenGiven { get; set; }

        [StringLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters")]
        public string? Notes { get; set; }

        public bool? IsCompleted { get; set; }
    }
}
