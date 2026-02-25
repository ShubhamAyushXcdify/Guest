using System;

namespace Application.DTOs
{
    public class UpdateUserClinicRequestDto
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public Guid? ClinicId { get; set; }
        public bool? IsPrimary { get; set; }
    }
} 