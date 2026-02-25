using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class ClientRegistrationResponseDto
    {
        public Guid Id { get; set; }
        public Guid? CompanyId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhonePrimary { get; set; } = string.Empty;
        public string? PhoneSecondary { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? Notes { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
        public Guid? ApprovedBy { get; set; }
        public DateTimeOffset? ApprovedAt { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public List<PatientResponseDto>? Pets { get; set; }
    }

    public class ClientRegistrationRequestDto
    {
        [Required(ErrorMessage = "Company ID is required")]
        public Guid CompanyId { get; set; }

        [Required(ErrorMessage = "First name is required")]
        [MaxLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required")]
        [MaxLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        [MaxLength(100, ErrorMessage = "Password cannot exceed 100 characters")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Primary phone is required")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        [MaxLength(20, ErrorMessage = "Primary phone cannot exceed 20 characters")]
        public string PhonePrimary { get; set; }

       
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

        
        [MaxLength(20, ErrorMessage = "Emergency contact phone cannot exceed 20 characters")]
        public string? EmergencyContactPhone { get; set; }

        [MaxLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }
        public bool IncludePetsInRegistration { get; set; } = false; // New property
        public List<CreatePatientForRegistrationRequestDto>? Pets { get; set; }
    }

    public class ApproveClientRegistrationRequestDto
    {
        [Required]
        public Guid RegistrationId { get; set; }

        [Required(ErrorMessage = "IsApproved is required")]
        public bool IsApproved { get; set; }

        [MaxLength(500, ErrorMessage = "Rejection reason cannot exceed 500 characters")]
        public string? RejectionReason { get; set; }
    }
}
