using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class PatientVisitDetailsResponseDto
    {
        // Patient details (without IDs)
        public string Name { get; set; } = string.Empty;
        public string Species { get; set; } = string.Empty;
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

        // Client (Owner) Information (without IDs)
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

        public List<AppointmentDetailsDto> Appointments { get; set; } = new List<AppointmentDetailsDto>();
    }

    public class AppointmentDetailsDto
    {
        public DateTime AppointmentDate { get; set; }
        public TimeSpan? AppointmentTimeFrom { get; set; }
        public TimeSpan? AppointmentTimeTo { get; set; }
        public string? AppointmentType { get; set; }
        public string? Reason { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
        public bool? IsRegistered { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public string? VeterinarianName { get; set; }
        public string? ClinicName { get; set; }
        public string? RoomName { get; set; }
        public PrescriptionDetailsDto? Prescription { get; set; }
    }

    public class PrescriptionDetailsDto
    {
        public string? Notes { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public List<PrescriptionProductDetailsDto> ProductMappings { get; set; } = new List<PrescriptionProductDetailsDto>();
    }

    public class PrescriptionProductDetailsDto
    {
        public bool IsChecked { get; set; }
        public int? Quantity { get; set; }
        public string? Frequency { get; set; }
        public string? Directions { get; set; }
        public int? NumberOfDays { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public ProductDetailsDto? Product { get; set; }
    }

    public class ProductDetailsDto
    {
        public string? ProductNumber { get; set; }
        public string? Name { get; set; }
        public string? GenericName { get; set; }
        public string? Category { get; set; }
        public string? Manufacturer { get; set; }
        public string? NdcNumber { get; set; }
        public string? Strength { get; set; }
        public string? DosageForm { get; set; }
        public string? UnitOfMeasure { get; set; }
        public bool? RequiresPrescription { get; set; }
        public string? ControlledSubstanceSchedule { get; set; }
        public string? BrandName { get; set; }
        public string? StorageRequirements { get; set; }
        public bool? IsActive { get; set; }
        public decimal? Price { get; set; }
        public decimal? SellingPrice { get; set; }
    }
}
