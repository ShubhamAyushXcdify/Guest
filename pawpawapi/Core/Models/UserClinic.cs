using System;

namespace Core.Models
{
    public class UserClinic
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public Guid? ClinicId { get; set; }
        public bool? IsPrimary { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTimeOffset? CreatedAt { get; set; }
    }
} 