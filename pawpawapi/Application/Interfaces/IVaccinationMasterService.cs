using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IVaccinationMasterService
    {
        Task<VaccinationMasterResponseDto> CreateAsync(CreateVaccinationMasterRequestDto dto);
        Task<VaccinationMasterResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<VaccinationMasterResponseDto>> GetAllAsync(string? species = null, bool? isCore = null);
        Task<VaccinationMasterResponseDto> UpdateAsync(UpdateVaccinationMasterRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 