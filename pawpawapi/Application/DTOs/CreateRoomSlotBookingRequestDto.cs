using System;

namespace Application.DTOs
{
    public class CreateRoomSlotBookingRequestDto
    {
        public Guid RoomSlotId { get; set; }
        public DateTime SlotDate { get; set; }
        public Guid? AppointmentId { get; set; }
    }
} 