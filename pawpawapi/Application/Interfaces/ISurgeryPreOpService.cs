using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface ISurgeryPreOpService
    {
        Task<SurgeryPreOpResponseDto> CreateAsync(CreateSurgeryPreOpRequestDto dto);
        Task<SurgeryPreOpResponseDto?> GetByIdAsync(Guid id);
        Task<SurgeryPreOpResponseDto?> GetByVisitIdAsync(Guid visitId);
        Task<SurgeryPreOpResponseDto> UpdateAsync(UpdateSurgeryPreOpRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 