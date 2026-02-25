using System;

namespace Core.Models
{
    public class Role
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; }
        public string Value { get; set; }
        public bool IsPrivileged { get; set; }
        public string? Metadata { get; set; } = "{}";
        public bool IsClinicRequired { get; set; }
        public string ColourName { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public int Priority { get; set; }
    }
} 