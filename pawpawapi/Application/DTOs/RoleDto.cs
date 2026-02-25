using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class RoleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public bool IsPrivileged { get; set; }
        public string? Metadata { get; set; } = "{}";
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsClinicRequired { get; set; }
        public string ColourName { get; set; } = string.Empty;
        public int Priority { get; set; }
    }

    public class CreateRoleDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Value { get; set; } = string.Empty;

        public bool IsPrivileged { get; set; }
        public string? Metadata { get; set; } = "{}";
        public bool IsClinicRequired { get; set; }

        [StringLength(50)]
        public string ColourName { get; set; } = string.Empty;
        public int Priority { get; set; }
    }

    public class UpdateRoleDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(100)]
        public string? Value { get; set; }

        public bool? IsPrivileged { get; set; }
        public string? Metadata { get; set; }
        public bool? IsClinicRequired { get; set; }

        [StringLength(50)]
        public string? ColourName { get; set; }
        public int? Priority { get; set; }
    }
}
