using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class VaccinationDischargeSummaryResponseDto
    {
        // Visit Information
        public Guid VisitId { get; set; }
        public Guid AppointmentId { get; set; }
        public Guid? PatientId { get; set; }
        public DateTimeOffset? VisitCreatedAt { get; set; }
        public DateTimeOffset? VisitUpdatedAt { get; set; }

        // Vaccination Visit Completion Status
        public bool? IsVaccinationDetailCompleted { get; set; }
        public bool IsVaccinationCompleted { get; set; }

        // Appointment Information
        public AppointmentResponseDto? Appointment { get; set; }

        // Patient Information
        public PatientResponseDto? Patient { get; set; }

        // Client Information
        public ClientResponseDto? Client { get; set; }

        // Veterinarian Information
        public UserResponseDto? Veterinarian { get; set; }

        // Clinic Information
        public ClinicResponseDto? Clinic { get; set; }

        // Room Information
        public RoomResponseDto? Room { get; set; }

        // Vaccination Visit Details
        public List<VaccinationDetailWithMastersResponseDto> VaccinationDetails { get; set; } = new();
    }

    public class VaccinationDetailWithMastersResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public List<VaccinationMasterWithDetailResponseDto> VaccinationMasters { get; set; } = new();
    }

    public class VaccinationMasterWithDetailResponseDto
    {
        public Guid Id { get; set; }
        public string? Species { get; set; }
        //public bool IsCore { get; set; }
        public string? Disease { get; set; }
        public string? VaccineType { get; set; }
        public string? InitialDose { get; set; }
        public string? Booster { get; set; }
        public string? RevaccinationInterval { get; set; }
        public string? Notes { get; set; }
        public string? VacCode { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public string? VaccinationJson { get; set; }
    }
} 