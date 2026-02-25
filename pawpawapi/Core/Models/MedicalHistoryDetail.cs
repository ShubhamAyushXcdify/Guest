using System;
using System.Collections.Generic;

namespace Core.Models
{
    public class MedicalHistoryDetail
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string? ChronicConditionsNotes { get; set; }
        public string? SurgeriesNotes { get; set; }
        public string? CurrentMedicationsNotes { get; set; }
        public string? GeneralNotes { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsCompleted { get; set; }
    }
} 