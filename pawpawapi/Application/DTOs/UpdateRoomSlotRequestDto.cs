using System;

namespace Application.DTOs
{
    public class UpdateRoomSlotRequestDto
    {
        public Guid Id { get; set; }
        public Guid ClinicId { get; set; }
        public Guid RoomId { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
       // public int DurationMinutes { get; set; }
        public bool IsActive { get; set; }

        //public bool IsAvailable { get; set; }
    }
}
