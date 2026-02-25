using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IVaccinationDetailService
    {
        Task<VaccinationDetailResponseDto> CreateAsync(CreateVaccinationDetailRequestDto dto);
        Task<VaccinationDetailResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<VaccinationDetailResponseDto>> GetByVisitIdAsync(Guid visitId);
        Task<VaccinationDetailResponseDto> UpdateAsync(UpdateVaccinationDetailRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> UpdateVaccinationJsonAsync(Guid vaccinationDetailId, Guid vaccinationMasterId, string vaccinationJson);
        Task<string?> GetVaccinationJsonAsync(Guid vaccinationDetailId, Guid vaccinationMasterId);
    }
} 