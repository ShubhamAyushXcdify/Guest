using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IDewormingCheckoutService
    {
        Task<DewormingCheckoutResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<DewormingCheckoutResponseDto>> GetByVisitIdAsync(Guid visitId);
        Task<DewormingCheckoutResponseDto> CreateAsync(CreateDewormingCheckoutRequestDto dto);
        Task<DewormingCheckoutResponseDto> UpdateAsync(UpdateDewormingCheckoutRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 