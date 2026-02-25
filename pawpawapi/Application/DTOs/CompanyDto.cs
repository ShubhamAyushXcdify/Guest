using System;

namespace Application.DTOs
{
    public class CompanyDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? DomainName { get; set; }
        public AddressDto? Address { get; set; }
        public string? PrivacyPolicy { get; set; }
        public string? TermsOfUse { get; set; }
        public string Status { get; set; } = "active";
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    public class CreateCompanyDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? DomainName { get; set; }
        public AddressDto? Address { get; set; }
        public string? PrivacyPolicy { get; set; }
        public string? TermsOfUse { get; set; }
        public string Status { get; set; } = "active";
    }

    public class UpdateCompanyDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? DomainName { get; set; }
        public AddressDto? Address { get; set; }
        public string? PrivacyPolicy { get; set; }
        public string? TermsOfUse { get; set; }
        public string? Status { get; set; }
    }

    public class AddressDto
    {
        public string? Street { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
    }
}
