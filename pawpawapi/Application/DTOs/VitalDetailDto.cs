using System;

namespace Application.DTOs
{
    public class VitalDetailResponseDto
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
    }

    public class CreateVitalDetailRequestDto
    {
        public Guid VisitId { get; set; }
        public decimal? TemperatureC { get; set; }
        public int? HeartRateBpm { get; set; }
        public int? RespiratoryRateBpm { get; set; }
        public string? MucousMembraneColor { get; set; }
        public decimal? CapillaryRefillTimeSec { get; set; }
        public string? HydrationStatus { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class UpdateVitalDetailRequestDto
    {
        public Guid Id { get; set; }
        public decimal? TemperatureC { get; set; }
        public int? HeartRateBpm { get; set; }
        public int? RespiratoryRateBpm { get; set; }
        public string? MucousMembraneColor { get; set; }
        public decimal? CapillaryRefillTimeSec { get; set; }
        public string? HydrationStatus { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
    }
} 