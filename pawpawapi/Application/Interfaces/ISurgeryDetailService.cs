using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface ISurgeryDetailService
    {
        Task<SurgeryDetailResponseDto> CreateAsync(CreateSurgeryDetailRequestDto dto);
        Task<SurgeryDetailResponseDto?> GetByIdAsync(Guid id);
        Task<SurgeryDetailResponseDto?> GetByVisitIdAsync(Guid visitId);
        Task<SurgeryDetailResponseDto> UpdateAsync(UpdateSurgeryDetailRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 