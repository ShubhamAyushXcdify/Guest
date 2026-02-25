using System;

namespace Core.Models
{
    public class Patient
    {
        public Guid Id { get; set; }
        public Guid? ClientId { get; set; }
        public Guid CompanyId { get; set; }
        public string Name { get; set; }
        public string Species { get; set; }
        public string? Breed { get; set; }
        public string? SecondaryBreed { get; set; }
        public string? Color { get; set; }
        public string? Gender { get; set; }
        public bool? IsNeutered { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public decimal? WeightKg { get; set; }
        public string? MicrochipNumber { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? InsuranceProvider { get; set; }
        public string? InsurancePolicyNumber { get; set; }
        public string? Allergies { get; set; }
        public string? MedicalConditions { get; set; }
        public string? BehavioralNotes { get; set; }
        public bool? IsActive { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        // Client (Owner) Information
        public string? ClientFirstName { get; set; }
        public string? ClientLastName { get; set; }
        public string? ClientEmail { get; set; }
        public string? ClientPhonePrimary { get; set; }
        public string? ClientPhoneSecondary { get; set; }
        public string? ClientAddressLine1 { get; set; }
        public string? ClientAddressLine2 { get; set; }
        public string? ClientCity { get; set; }
        public string? ClientState { get; set; }
        public string? ClientPostalCode { get; set; }
        public string? ClientEmergencyContactName { get; set; }
        public string? ClientEmergencyContactPhone { get; set; }
        public string? ClientNotes { get; set; }
    }
} 