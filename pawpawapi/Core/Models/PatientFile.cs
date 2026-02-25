using System;
using System.Collections.Generic;

namespace Core.Models
{
    public class PatientFile
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public Guid? VisitId { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid CreatedBy { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public Patient? Patient { get; set; }
        public User? Creator { get; set; }
        public ICollection<PatientFileAttachment>? Attachments { get; set; }
    }
}

