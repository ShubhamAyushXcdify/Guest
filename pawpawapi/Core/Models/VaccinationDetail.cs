using System;
using System.Collections.Generic;

namespace Core.Models
{
    public class VaccinationDetail
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public List<VaccinationMaster> VaccinationMasters { get; set; } = new();
    }
} 