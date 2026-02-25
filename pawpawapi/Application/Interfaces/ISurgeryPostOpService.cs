using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface ISurgeryPostOpService
    {
        Task<SurgeryPostOpResponseDto> GetByIdAsync(Guid id);
        Task<SurgeryPostOpResponseDto> GetByVisitIdAsync(Guid visitId);
        Task<SurgeryPostOpResponseDto> CreateAsync(CreateSurgeryPostOpRequestDto dto);
        Task<SurgeryPostOpResponseDto> UpdateAsync(UpdateSurgeryPostOpRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 