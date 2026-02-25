using System;

namespace Core.Models
{
    public class PatientReport
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public Guid CreatedById { get; set; }
        public string HtmlFile { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public Patient? Patient { get; set; }
        public User? Doctor { get; set; }
        public User? Creator { get; set; }
    }
}

