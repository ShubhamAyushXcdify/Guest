using System;
using System.Collections.Generic;

namespace Core.Models
{
    public class VitalDetail
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public decimal? TemperatureC { get; set; }
        public int? HeartRateBpm { get; set; }
        public int? RespiratoryRateBpm { get; set; }
        public string? MucousMembraneColor { get; set; }
        public decimal? CapillaryRefillTimeSec { get; set; }
        public string? HydrationStatus { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public Visit? Visit { get; set; }
    }
} 