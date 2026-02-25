using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class ClientResponseDto
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
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

    public class CreateClientRequestDto
    {
        [Required(ErrorMessage = "Company ID is required")]
        public Guid CompanyId { get; set; }

        [Required(ErrorMessage = "First name is required")]
        [MaxLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required")]
        [MaxLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
        public string LastName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string? Email { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format")]
        [MaxLength(20, ErrorMessage = "Primary phone cannot exceed 20 characters")]
        public string? PhonePrimary { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format")]
        [MaxLength(20, ErrorMessage = "Secondary phone cannot exceed 20 characters")]
        public string? PhoneSecondary { get; set; }

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

        [MaxLength(100, ErrorMessage = "Emergency contact name cannot exceed 100 characters")]
        public string? EmergencyContactName { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format")]
        [MaxLength(20, ErrorMessage = "Emergency contact phone cannot exceed 20 characters")]
        public string? EmergencyContactPhone { get; set; }

        [MaxLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }

        public bool? IsActive { get; set; } = true;
        public bool IsPremium { get; set; } = false;
    }

    public class UpdateClientRequestDto
    {
        [Required]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Company ID is required")]
        public Guid CompanyId { get; set; }

        [Required(ErrorMessage = "First name is required")]
        [MaxLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required")]
        [MaxLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
        public string LastName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string? Email { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format")]
        [MaxLength(20, ErrorMessage = "Primary phone cannot exceed 20 characters")]
        public string? PhonePrimary { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format")]
        [MaxLength(20, ErrorMessage = "Secondary phone cannot exceed 20 characters")]
        public string? PhoneSecondary { get; set; }

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

        [MaxLength(100, ErrorMessage = "Emergency contact name cannot exceed 100 characters")]
        public string? EmergencyContactName { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format")]
        [MaxLength(20, ErrorMessage = "Emergency contact phone cannot exceed 20 characters")]
        public string? EmergencyContactPhone { get; set; }

        [MaxLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }

        public bool? IsActive { get; set; }
        public bool IsPremium { get; set; } = false;
    }

    public class RequestClientDeleteOtpDto
    {
        [Required(ErrorMessage = "Client ID is required")]
        public Guid ClientId { get; set; }
    }

    public class VerifyClientDeleteOtpDto
    {
        [Required(ErrorMessage = "Client ID is required")]
        public Guid ClientId { get; set; }

        [Required(ErrorMessage = "OTP is required")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be 6 digits")]
        public string Otp { get; set; } = string.Empty;
    }
}
