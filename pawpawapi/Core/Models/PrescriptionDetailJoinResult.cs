// Core/Models/PrescriptionDetailJoinResult.cs
using System;

namespace Core.Models
{
    public class PrescriptionDetailJoinResult
    {
        // PrescriptionDetail
        public Guid PrescriptionDetailId { get; set; }
        public string? Notes { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }

        // Visit
        public Guid VisitId { get; set; }
        public Guid AppointmentId { get; set; }
        public bool IsIntakeCompleted { get; set; }
        public bool IsComplaintsCompleted { get; set; }
        public bool IsVitalsCompleted { get; set; }
        public bool IsPlanCompleted { get; set; }
        public DateTimeOffset VisitCreatedAt { get; set; }
        public DateTimeOffset VisitUpdatedAt { get; set; }

        // Appointment
        public Guid? ClinicId { get; set; }
        public Guid? PatientId { get; set; }
        public Guid? ClientId { get; set; }
        public Guid? VeterinarianId { get; set; }
        public string? VeterinarianName { get; set; }
        public Guid? RoomId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public Guid? RoomSlotId { get; set; }
        public string? AppointmentType { get; set; }
        public string? Reason { get; set; }
        public string? Status { get; set; }
        public string? AppointmentNotes { get; set; }
        
        // Product Mapping
        public Guid? ProductMappingId { get; set; }
        public Guid? ProductId { get; set; }
        public string? Dosage { get; set; }
        public string? Frequency { get; set; }
        public int? Quantity { get; set; }
        public int? NumberOfDays { get; set; }
        
        // Product details
        public Guid? Product_Id { get; set; }
        public string? Product_Name { get; set; }
        public string? Product_GenericName { get; set; }
        public string? Product_Category { get; set; }
        // Product type removed
        public string? Product_Manufacturer { get; set; }
        public string? Product_NdcNumber { get; set; }
        public string? Product_Strength { get; set; }
        public string? Product_DosageForm { get; set; }
        public string? Product_UnitOfMeasure { get; set; }
        public bool? Product_RequiresPrescription { get; set; }
        public string? Product_ControlledSubstanceSchedule { get; set; }
        public string? Product_StorageRequirements { get; set; }
        public bool? Product_IsActive { get; set; }
    }
}