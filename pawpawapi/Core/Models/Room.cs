using System;

namespace Core.Models
{
    public class Room
    {
        public Guid Id { get; set; }
        public Guid? ClinicId { get; set; }
        public string Name { get; set; }
        public string? RoomType { get; set; }
        public bool? IsActive { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
    }
} 