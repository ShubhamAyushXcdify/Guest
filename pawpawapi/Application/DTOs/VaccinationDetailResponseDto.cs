using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class VaccinationDetailResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public List<VaccinationMasterResponseDto> VaccinationMasterIdsDetails { get; set; } = new();
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class CreateVaccinationDetailRequestDto
    {
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public List<Guid> VaccinationMasterIds { get; set; } = new();
    }

    public class UpdateVaccinationDetailRequestDto
    {
        public Guid Id { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public List<Guid> VaccinationMasterIds { get; set; } = new();
    }

    // Preserved for batch creation functionality
    public class BatchCreateVaccinationDetailRequestDto
    {
        public Guid VisitId { get; set; }
        public List<CreateVaccinationDetailRequestDto> Details { get; set; } = new();
    }

    public class BatchUpdateVaccinationDetailRequestDto
    {
        public Guid VisitId { get; set; }
        public Guid VaccinationMasterId { get; set; }
        public string VaccinationJson { get; set; } = string.Empty;
    }
} 