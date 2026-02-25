using System;

namespace Core.Models
{
    public class RoomSlotBooking
    {
        public Guid Id { get; set; }
        public Guid RoomSlotId { get; set; }
        public DateTime SlotDate { get; set; }
        public bool IsBooked { get; set; }
        public Guid? AppointmentId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 