// Application/DTOs/PrescriptionDetailFullResponseDto.cs
using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class PrescriptionDetailFullResponseDto
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

        // Product Mappings
        public List<PrescriptionProductMappingDto> ProductMappings { get; set; } = new();
    }

    /*public class PrescriptionProductMappingDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string? Dosage { get; set; }
        public string? Frequency { get; set; }
    }*/
}