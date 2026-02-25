using System;

namespace Application.DTOs
{
    public class CreateUserClinicRequestDto
    {
        public Guid? UserId { get; set; }
        public Guid? ClinicId { get; set; }
        public bool? IsPrimary { get; set; }
    }
} 