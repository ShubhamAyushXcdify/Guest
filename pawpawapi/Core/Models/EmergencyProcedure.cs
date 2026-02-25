using System;

namespace Core.Models
{
    public class EmergencyProcedure
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public DateTime? ProcedureTime { get; set; }
        public bool IvCatheterPlacement { get; set; }
        public bool OxygenTherapy { get; set; }
        public bool Cpr { get; set; }
        public bool WoundCare { get; set; }
        public bool Bandaging { get; set; }
        public bool Defibrillation { get; set; }
        public bool BloodTransfusion { get; set; }
        public bool Intubation { get; set; }
        public bool OtherProcedure { get; set; }
        public string? OtherProcedurePerformed { get; set; }
        public string? PerformedBy { get; set; }
        public string? FluidsType { get; set; }
        public decimal? FluidsVolumeMl { get; set; }
        public decimal? FluidsRateMlHr { get; set; }
        public string? ResponseToTreatment { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

   /* public class EmergencyProcedureMedication
    {
        public Guid Id { get; set; }
        public Guid EmergencyProcedureId { get; set; }
        public string? Name { get; set; }
        public string? Dose { get; set; }
        public string? Route { get; set; }
        public TimeSpan? Time { get; set; }
        public EmergencyProcedure? EmergencyProcedure { get; set; }
    }*/
} 