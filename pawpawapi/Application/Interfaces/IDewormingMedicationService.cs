using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IDewormingMedicationService
    {
        Task<DewormingMedicationResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<DewormingMedicationResponseDto>> GetByVisitIdAsync(Guid visitId);
        Task<DewormingMedicationResponseDto> CreateAsync(CreateDewormingMedicationRequestDto dto);
        Task<DewormingMedicationResponseDto> UpdateAsync(UpdateDewormingMedicationRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 