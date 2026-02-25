using System;

namespace Core.Models
{
    public class EmergencyVital
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
        public bool SupplementalOxygenGiven { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 