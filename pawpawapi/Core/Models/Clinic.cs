using System;

namespace Core.Models
{
    public class Clinic
    {
        public Guid Id { get; set; }
        public Guid? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public string Name { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? TaxId { get; set; }
        public string? LicenseNumber { get; set; }
        public string? SubscriptionStatus { get; set; }
        public DateTimeOffset? SubscriptionExpiresAt { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public Location? Location { get; set; }
    }

    public class Location
    {
        public double? Lat { get; set; }
        public double? Lng { get; set; }
        public string? Address { get; set; }
    }
} 