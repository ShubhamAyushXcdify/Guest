using System;

namespace Application.DTOs
{
    public class CreateRoomRequestDto
    {
        public Guid? ClinicId { get; set; }
        public string Name { get; set; }
        public string? RoomType { get; set; }
        public bool? IsActive { get; set; }
    }
} 