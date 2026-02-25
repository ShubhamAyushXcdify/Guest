using System;

namespace Core.Models
{
    public class UserDoctorSlot
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid SlotId { get; set; }
        public Guid? ClinicId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Extended properties for slot details (populated when joined with doctor_slot table)
        public string? Day { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? SlotCreatedAt { get; set; }
        public DateTime? SlotUpdatedAt { get; set; }
    }
}
