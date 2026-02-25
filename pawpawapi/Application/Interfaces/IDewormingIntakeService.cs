using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IDewormingIntakeService
    {
        Task<DewormingIntakeResponseDto> CreateAsync(CreateDewormingIntakeRequestDto dto);
        Task<DewormingIntakeResponseDto?> GetByIdAsync(Guid id);
        Task<DewormingIntakeResponseDto?> GetByVisitIdAsync(Guid visitId);
        Task<DewormingIntakeResponseDto> UpdateAsync(UpdateDewormingIntakeRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 