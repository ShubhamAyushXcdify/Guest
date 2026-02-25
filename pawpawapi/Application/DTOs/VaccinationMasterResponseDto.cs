using System;

namespace Application.DTOs
{
    public class VaccinationMasterResponseDto
    {
        public Guid Id { get; set; }
        public string? Species { get; set; }
        public string? Disease { get; set; }
        public string? VaccineType { get; set; }
        public string? InitialDose { get; set; }
        public string? Booster { get; set; }
        public string? RevaccinationInterval { get; set; }
        public string? Notes { get; set; }
        public string? VacCode { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    public class CreateVaccinationMasterRequestDto
    {
        public string? Species { get; set; }
        public string? Disease { get; set; }
        public string? VaccineType { get; set; }
        public string? InitialDose { get; set; }
        public string? Booster { get; set; }
        public string? RevaccinationInterval { get; set; }
        public string? Notes { get; set; }
        public string? VacCode { get; set; }
    }

    public class UpdateVaccinationMasterRequestDto
    {
        public Guid Id { get; set; }
        public string? Species { get; set; }
        public string? Disease { get; set; }
        public string? VaccineType { get; set; }
        public string? InitialDose { get; set; }
        public string? Booster { get; set; }
        public string? RevaccinationInterval { get; set; }
        public string? Notes { get; set; }
        public string? VacCode { get; set; }
    }
} 