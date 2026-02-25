using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class UserResponseDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? RoleName { get; set; }
        public Guid RoleId { get; set; }
        public Guid? CompanyId { get; set; }
        public List<UserClinicDto>? Clinics { get; set; }
        public bool? IsActive { get; set; }
        public DateTimeOffset? LastLogin { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public List<DoctorSlotDto>? DoctorSlots { get; set; }
    }

    public class UserClinicDto
    {
        public Guid ClinicId { get; set; }
        public string? ClinicName { get; set; }
    }
}