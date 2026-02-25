using System;

namespace Core.Models
{
    public class Company
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? DomainName { get; set; }
        public string? Address { get; set; } // JSON column for address object
        public string? PrivacyPolicy { get; set; }
        public string? TermsOfUse { get; set; }
        public string Status { get; set; } = "active";
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}
