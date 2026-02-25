using System;

namespace Application.DTOs
{
    public class UpdateRoomRequestDto
    {
        public Guid Id { get; set; }
        public Guid? ClinicId { get; set; }
        public string Name { get; set; }
        public string? RoomType { get; set; }
        public bool? IsActive { get; set; }
    }
} 