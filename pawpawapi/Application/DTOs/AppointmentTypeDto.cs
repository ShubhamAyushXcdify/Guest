using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class AppointmentTypeResponseDto
    {
        public Guid AppointmentTypeId { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateAppointmentTypeRequestDto
    {
        [Required(ErrorMessage = "Name is required")]
        [MaxLength(100)]
        public string Name { get; set; }
        
        public bool IsActive { get; set; } = true;
    }

    public class UpdateAppointmentTypeRequestDto
    {
        [Required]
        public Guid Id { get; set; }
        
        [Required(ErrorMessage = "Name is required")]
        [MaxLength(100)]
        public string Name { get; set; }
        
        public bool IsActive { get; set; }
    }
}
