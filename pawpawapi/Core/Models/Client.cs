using System;

namespace Core.Models
{
    public class Client
    {
        public Guid? Id { get; set; }
        public Guid CompanyId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EncryptedPassword { get; set; }
        public string? Email { get; set; }
        public string? PhonePrimary { get; set; }
        public string? PhoneSecondary { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? Notes { get; set; }
        public bool? IsActive { get; set; }
        public bool IsPremium { get; set; } = false;
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
} 