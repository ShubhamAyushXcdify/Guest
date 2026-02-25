using System;

namespace Application.DTOs
{
    public class RoomResponseDto
    {
        public Guid Id { get; set; }
        public Guid? ClinicId { get; set; }
        public string Name { get; set; }
        public string? RoomType { get; set; }
        public bool? IsActive { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
    }
} 