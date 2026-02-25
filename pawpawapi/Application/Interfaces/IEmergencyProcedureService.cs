using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IEmergencyProcedureService
    {
        Task<EmergencyProcedureResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<EmergencyProcedureResponseDto>> GetAllAsync();
        Task<IEnumerable<EmergencyProcedureResponseDto>> GetByVisitIdAsync(Guid visitId);
        Task<EmergencyProcedureResponseDto> CreateAsync(CreateEmergencyProcedureRequestDto dto);
        Task<EmergencyProcedureResponseDto> UpdateAsync(UpdateEmergencyProcedureRequestDto dto);
        Task DeleteAsync(Guid id);
    }
}