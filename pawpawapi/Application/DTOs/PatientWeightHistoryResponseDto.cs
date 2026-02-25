using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class PatientWeightHistoryResponseDto
    {
        public Guid PatientId { get; set; }
        public string? PatientName { get; set; }
        public List<WeightHistoryItemDto> WeightHistory { get; set; } = new List<WeightHistoryItemDto>();
    }

    public class WeightHistoryItemDto
    {
        public decimal? WeightKg { get; set; }
        public DateTime? Date { get; set; }
        public string Source { get; set; } = string.Empty; // "Appointment", "Intake", "Deworming", "Emergency", "Surgery"
        public Guid? AppointmentId { get; set; }
        public Guid? VisitId { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
    }
}

