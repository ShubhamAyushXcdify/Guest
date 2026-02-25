using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IEmergencyVitalService
    {
        Task<EmergencyVitalResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<EmergencyVitalResponseDto>> GetAllAsync();
        Task<IEnumerable<EmergencyVitalResponseDto>> GetByVisitIdAsync(Guid visitId);
        Task<EmergencyVitalResponseDto> CreateAsync(CreateEmergencyVitalRequestDto dto);
        Task<EmergencyVitalResponseDto> UpdateAsync(UpdateEmergencyVitalRequestDto dto);
        Task DeleteAsync(Guid id);
    }
}