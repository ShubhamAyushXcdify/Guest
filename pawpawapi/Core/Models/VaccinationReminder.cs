using System;

namespace Core.Models
{
    /// <summary>
    /// Represents vaccination reminder data for email notifications
    /// </summary>
    public class VaccinationReminder
    {
        public Guid VaccinationDetailId { get; set; }
        public Guid VaccinationMasterId { get; set; }
        public string VaccinationJson { get; set; } = string.Empty;
        
        // Client Info
        public Guid ClientId { get; set; }
        public string ClientEmail { get; set; } = string.Empty;
        public string ClientFirstName { get; set; } = string.Empty;
        public string ClientLastName { get; set; } = string.Empty;
        
        // Patient Info
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientSpecies { get; set; } = string.Empty;
        public string? PatientBreed { get; set; }
        
        // Appointment Info
        public Guid AppointmentId { get; set; }
        
        // Clinic Info
        public Guid ClinicId { get; set; }
        public string ClinicName { get; set; } = string.Empty;
        public string? ClinicPhone { get; set; }
        public string? ClinicEmail { get; set; }
        public string? ClinicAddress { get; set; }
        
        // Company Info
        public Guid CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        
        // Vaccination Master Info
        public string VaccineDisease { get; set; } = string.Empty;
        public string VaccineType { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// Represents the vaccination JSON data structure
    /// </summary>
    public class VaccinationJsonData
    {
        public DateTimeOffset NextDueDate { get; set; }
        public string? BatchNumber { get; set; }
        public string? VeterinarianId { get; set; }
        public string? AdverseReactions { get; set; }
        public string? Manufacturer { get; set; }
        public string? DoseVolume { get; set; }
        public string? Route { get; set; }
        public string? AdditionalNotes { get; set; }
    }
}

