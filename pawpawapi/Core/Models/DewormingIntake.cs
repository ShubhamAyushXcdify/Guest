using System;

namespace Core.Models
{
    public class DewormingIntake
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public decimal? WeightKg { get; set; }
        public DateTime? LastDewormingDate { get; set; }
        public string? SymptomsNotes { get; set; }
        public decimal? TemperatureC { get; set; }
        public string? AppetiteFeedingNotes { get; set; }
        public string? CurrentMedications { get; set; }
        public bool IsStoolSampleCollected { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 