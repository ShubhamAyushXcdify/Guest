using System;

namespace Application.DTOs
{
    public class UserSlotDto
    {
        public Guid Id { get; set; }
        public string Day { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public Guid? ClinicId { get; set; }
    }
}
