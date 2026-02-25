using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface ISurgeryDischargeService
    {
        Task<SurgeryDischargeResponseDto> GetByIdAsync(Guid id);
        Task<SurgeryDischargeResponseDto> GetByVisitIdAsync(Guid visitId);
        Task<SurgeryDischargeResponseDto> CreateAsync(CreateSurgeryDischargeRequestDto dto);
        Task<SurgeryDischargeResponseDto> UpdateAsync(UpdateSurgeryDischargeRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 