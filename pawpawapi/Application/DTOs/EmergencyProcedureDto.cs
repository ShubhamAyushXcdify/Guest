using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class EmergencyProcedureResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public DateTime? ProcedureTime { get; set; }
        public bool? IvCatheterPlacement { get; set; }
        public bool? OxygenTherapy { get; set; }
        public bool? Cpr { get; set; }
        public bool? WoundCare { get; set; }
        public bool? Bandaging { get; set; }
        public bool? Defibrillation { get; set; }
        public bool? BloodTransfusion { get; set; }
        public bool? Intubation { get; set; }
        public bool? OtherProcedure { get; set; }
        public string? OtherProcedurePerformed { get; set; }
        public string? PerformedBy { get; set; }
        public string? FluidsType { get; set; }
        public decimal? FluidsVolumeMl { get; set; }
        public decimal? FluidsRateMlHr { get; set; }
        public string? ResponseToTreatment { get; set; }
        public string? Notes { get; set; }
        public bool? IsCompleted { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateEmergencyProcedureRequestDto
    {
        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        public DateTime? ProcedureTime { get; set; }

        public bool? IvCatheterPlacement { get; set; }
        public bool? OxygenTherapy { get; set; }
        public bool? Cpr { get; set; }
        public bool? WoundCare { get; set; }
        public bool? Bandaging { get; set; }
        public bool? Defibrillation { get; set; }
        public bool? BloodTransfusion { get; set; }
        public bool? Intubation { get; set; }
        public bool? OtherProcedure { get; set; }

        [StringLength(500, ErrorMessage = "Other procedure description cannot exceed 500 characters")]
        public string? OtherProcedurePerformed { get; set; }

        [StringLength(200, ErrorMessage = "Performed by cannot exceed 200 characters")]
        public string? PerformedBy { get; set; }

        [StringLength(100, ErrorMessage = "Fluids type cannot exceed 100 characters")]
        public string? FluidsType { get; set; }

        [Range(0.1, 10000, ErrorMessage = "Fluids volume must be between 0.1 and 10000 mL")]
        public decimal? FluidsVolumeMl { get; set; }
        
        public decimal? FluidsRateMlHr { get; set; }  

        [StringLength(200)]
        public string? ResponseToTreatment { get; set; }

        public bool? IsCompleted { get; set; } = false;
    }

    public class UpdateEmergencyProcedureRequestDto
    {
        [Required(ErrorMessage = "ID is required")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        public DateTime? ProcedureTime { get; set; }

        public bool? IvCatheterPlacement { get; set; }
        public bool? OxygenTherapy { get; set; }
        public bool? Cpr { get; set; }
        public bool? WoundCare { get; set; }
        public bool? Bandaging { get; set; }
        public bool? Defibrillation { get; set; }
        public bool? BloodTransfusion { get; set; }
        public bool? Intubation { get; set; }
        public bool? OtherProcedure { get; set; }

        [StringLength(500, ErrorMessage = "Other procedure description cannot exceed 500 characters")]
        public string? OtherProcedurePerformed { get; set; }

        [StringLength(200, ErrorMessage = "Performed by cannot exceed 200 characters")]
        public string? PerformedBy { get; set; }

        [StringLength(100, ErrorMessage = "Fluids type cannot exceed 100 characters")]
        public string? FluidsType { get; set; }

        [Range(0.1, 10000, ErrorMessage = "Fluids volume must be between 0.1 and 10000 mL")]
        public decimal? FluidsVolumeMl { get; set; }

        public decimal? FluidsRateMlHr { get; set; }  

        [StringLength(200)]
        public string? ResponseToTreatment { get; set; }
        public bool? IsCompleted { get; set; }
    }
}
