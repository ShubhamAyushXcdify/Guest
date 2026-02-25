using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface ISymptomService
    {
        Task<SymptomResponseDto> CreateAsync(CreateSymptomRequestDto request);
        Task<IEnumerable<SymptomResponseDto>> GetAllAsync();
        Task<IEnumerable<SymptomResponseDto>> GetByBreedAsync(string? breed);
        Task<SymptomResponseDto> GetByIdAsync(Guid id);
        Task<SymptomResponseDto> UpdateAsync(UpdateSymptomRequestDto request);
        Task<bool> DeleteAsync(Guid id);
    }
} 