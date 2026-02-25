using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IEmergencyVisitService
    {
        Task<EmergencyTriageResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<EmergencyTriageResponseDto>> GetAllAsync();
        Task<EmergencyTriageResponseDto> CreateAsync(CreateEmergencyTriageRequestDto dto);
        Task<EmergencyTriageResponseDto> UpdateAsync(UpdateEmergencyTriageRequestDto dto);
        Task DeleteAsync(Guid id);
        Task<IEnumerable<EmergencyTriageResponseDto>> GetByVisitIdAsync(Guid visitId);
    }
}