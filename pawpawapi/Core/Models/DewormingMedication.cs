using System;
using System.Collections.Generic;

namespace Core.Models
{
    public class DewormingMedication
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? Route { get; set; }
        public DateTime? DateTimeGiven { get; set; }
        public string? VeterinarianName { get; set; }
        public string? AdministeredBy { get; set; }
        public string? Remarks { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 