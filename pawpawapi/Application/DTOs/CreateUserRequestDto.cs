using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class CreateUserRequestDto
    {
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string? LastName { get; set; }
        public Guid RoleId { get; set; }
        public Guid? CompanyId { get; set; }
        public List<Guid>? ClinicIds { get; set; } // Changed to array of clinic IDs
        public IEnumerable<Guid>? Slots { get; set; } // Added for doctor slot mapping
    }
}