using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class UpdateUserRequestDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string? LastName { get; set; }
        //public string RoleName { get; set; }
        public Guid RoleId { get; set; }
        public Guid? CompanyId { get; set; }
        public List<Guid>? ClinicIds { get; set; } // Changed to array of clinic IDs
        public bool? IsActive { get; set; }
        public List<Guid>? Slots { get; set; }
    }
}