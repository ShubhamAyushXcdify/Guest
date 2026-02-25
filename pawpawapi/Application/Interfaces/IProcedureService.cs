using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IProcedureService
    {
        Task<ProcedureResponseDto> CreateAsync(CreateProcedureRequestDto request);
        Task<IEnumerable<ProcedureResponseDto>> GetAllAsync(string? type = null);
        Task<ProcedureResponseDto> GetByIdAsync(Guid id);
        Task<ProcedureResponseDto> UpdateAsync(UpdateProcedureRequestDto request);
        Task<bool> DeleteAsync(Guid id);
    }
} 