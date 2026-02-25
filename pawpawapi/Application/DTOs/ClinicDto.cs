using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class ClinicResponseDto
    {
        public Guid Id { get; set; }
        public Guid? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? Description { get; set; }
        public string? TaxId { get; set; }
        public string? LicenseNumber { get; set; }
        public string? SubscriptionStatus { get; set; }
        public DateTimeOffset? SubscriptionExpiresAt { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public LocationDto? Location { get; set; }
    }

    public class CreateClinicRequestDto
    {
        [Required(ErrorMessage = "Company ID is required")]
        public Guid CompanyId { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; }

        [MaxLength(1000, ErrorMessage = "Address line 1 cannot exceed 1000 characters")]
        public string? AddressLine1 { get; set; }

        [MaxLength(1000, ErrorMessage = "Address line 2 cannot exceed 1000 characters")]
        public string? AddressLine2 { get; set; }

        [MaxLength(50, ErrorMessage = "City cannot exceed 50 characters")]
        public string? City { get; set; }

        [MaxLength(50, ErrorMessage = "State cannot exceed 50 characters")]
        public string? State { get; set; }

        [MaxLength(20, ErrorMessage = "Postal code cannot exceed 20 characters")]
        public string? PostalCode { get; set; }

        [MaxLength(50, ErrorMessage = "Country cannot exceed 50 characters")]
        public string? Country { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format")]
        [MaxLength(20, ErrorMessage = "Phone cannot exceed 20 characters")]
        public string? Phone { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string? Email { get; set; }

        [MaxLength(200, ErrorMessage = "Website cannot exceed 200 characters")]
        public string? Website { get; set; }

        [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        [MaxLength(50, ErrorMessage = "Tax ID cannot exceed 50 characters")]
        public string? TaxId { get; set; }

        [MaxLength(50, ErrorMessage = "License number cannot exceed 50 characters")]
        public string? LicenseNumber { get; set; }

        [MaxLength(20, ErrorMessage = "Subscription status cannot exceed 20 characters")]
        public string? SubscriptionStatus { get; set; }

        public DateTimeOffset? SubscriptionExpiresAt { get; set; }

        public LocationDto? Location { get; set; }
    }

    public class UpdateClinicRequestDto
    {
        [Required]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Company ID is required")]
        public Guid CompanyId { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; }

        [MaxLength(100, ErrorMessage = "Address line 1 cannot exceed 100 characters")]
        public string? AddressLine1 { get; set; }

        [MaxLength(100, ErrorMessage = "Address line 2 cannot exceed 100 characters")]
        public string? AddressLine2 { get; set; }

        [MaxLength(50, ErrorMessage = "City cannot exceed 50 characters")]
        public string? City { get; set; }

        [MaxLength(50, ErrorMessage = "State cannot exceed 50 characters")]
        public string? State { get; set; }

        [MaxLength(20, ErrorMessage = "Postal code cannot exceed 20 characters")]
        public string? PostalCode { get; set; }

        [MaxLength(50, ErrorMessage = "Country cannot exceed 50 characters")]
        public string? Country { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format")]
        [MaxLength(20, ErrorMessage = "Phone cannot exceed 20 characters")]
        public string? Phone { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string? Email { get; set; }

        [Url(ErrorMessage = "Invalid website URL format")]
        [MaxLength(200, ErrorMessage = "Website cannot exceed 200 characters")]
        public string? Website { get; set; }

        [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        [MaxLength(50, ErrorMessage = "Tax ID cannot exceed 50 characters")]
        public string? TaxId { get; set; }

        [MaxLength(50, ErrorMessage = "License number cannot exceed 50 characters")]
        public string? LicenseNumber { get; set; }

        [MaxLength(20, ErrorMessage = "Subscription status cannot exceed 20 characters")]
        public string? SubscriptionStatus { get; set; }

        public DateTimeOffset? SubscriptionExpiresAt { get; set; }

        public LocationDto? Location { get; set; }
    }

    public class LocationDto
    {
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
        public double? Lat { get; set; }

        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
        public double? Lng { get; set; }

        [MaxLength(200, ErrorMessage = "Address cannot exceed 200 characters")]
        public string? Address { get; set; }
    }
}
