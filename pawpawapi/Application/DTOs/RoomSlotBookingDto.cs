using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class RoomSlotBookingDto
    {
        public Guid Id { get; set; }
        public Guid RoomSlotId { get; set; }
        public DateTime SlotDate { get; set; }
        public bool IsBooked { get; set; }
        public Guid? AppointmentId { get; set; }
    }

} 