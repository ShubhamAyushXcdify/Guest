using System;

namespace Core.Models
{
    /// <summary>
    /// Represents deworming reminder data for email notifications
    /// </summary>
    public class DewormingReminder
    {
        public Guid DewormingCheckoutId { get; set; }
        public Guid VisitId { get; set; }
        public DateTimeOffset NextDewormingDueDate { get; set; }
        public string? Summary { get; set; }
        public string? HomeCareInstructions { get; set; }
        
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
    }
}

