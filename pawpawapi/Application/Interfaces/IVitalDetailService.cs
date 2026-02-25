using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IVitalDetailService
    {
        Task<VitalDetailResponseDto> GetByIdAsync(Guid id);
        Task<VitalDetailResponseDto> GetByVisitIdAsync(Guid visitId);
        Task<VitalDetailResponseDto> CreateAsync(CreateVitalDetailRequestDto dto);
        Task<VitalDetailResponseDto> UpdateAsync(UpdateVitalDetailRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 