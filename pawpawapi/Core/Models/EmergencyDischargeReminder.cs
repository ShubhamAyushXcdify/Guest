using System;

namespace Core.Models
{
    /// <summary>
    /// Represents emergency discharge reminder data for email notifications
    /// </summary>
    public class EmergencyDischargeReminder
    {
        public Guid EmergencyDischargeId { get; set; }
        public Guid VisitId { get; set; }
        public DateTime FollowupDate { get; set; }
        public string? DischargeStatus { get; set; }
        public string? DischargeSummary { get; set; }
        public string? HomeCareInstructions { get; set; }
        public string? FollowupInstructions { get; set; }
        public string? ResponsibleClinician { get; set; }
        
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
