using System;

namespace Core.Models
{
    public class EmergencyTriage
    {
        public Guid Id { get; set; }
        public DateTime ArrivalTime { get; set; }
        public string? TriageNurseDoctor { get; set; }
        public string? TriageCategory { get; set; }
        public int? PainScore { get; set; }
        public string? Allergies { get; set; }
        public bool ImmediateInterventionRequired { get; set; }
        public string? ReasonForEmergency { get; set; }
        public string? TriageLevel { get; set; }
        public string? PresentingComplaint { get; set; }
        public string? InitialNotes { get; set; }
        public bool? IsComplete { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? VisitId { get; set; }
    }
} 