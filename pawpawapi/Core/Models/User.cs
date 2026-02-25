using System;
using System.Collections.Generic;

namespace Core.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public Guid RoleId { get; set; }
        public string RoleName { get; set; }
        public string? RoleValue { get; set; }
        public Guid? CompanyId { get; set; }
        public bool? IsActive { get; set; }
        public DateTimeOffset? LastLogin { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        // Navigation property for clinic mappings
        public List<UserClinicMapping>? ClinicMappings { get; set; }
    }

    public class UserClinicMapping
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid ClinicId { get; set; }
        public string? ClinicName { get; set; } // For query results
        public bool IsActive { get; set; } = true;
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}