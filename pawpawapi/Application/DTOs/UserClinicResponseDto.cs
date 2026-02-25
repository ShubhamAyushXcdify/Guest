using System;

namespace Application.DTOs
{
    public class UserClinicResponseDto
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public Guid? ClinicId { get; set; }
        public bool? IsPrimary { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
    }
} 