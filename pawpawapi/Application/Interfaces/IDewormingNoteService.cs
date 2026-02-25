using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IDewormingNoteService
    {
        Task<DewormingNoteResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<DewormingNoteResponseDto>> GetByVisitIdAsync(Guid visitId);
        Task<DewormingNoteResponseDto> CreateAsync(CreateDewormingNoteRequestDto dto);
        Task<DewormingNoteResponseDto> UpdateAsync(UpdateDewormingNoteRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 