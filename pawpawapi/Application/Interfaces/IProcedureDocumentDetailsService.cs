using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IProcedureDocumentDetailsService
    {
        Task<ProcedureDocumentDetailsResponseDto> GetByVisitAndProcedureAsync(Guid visitId, Guid procedureId);
        Task<ProcedureDocumentDetailsResponseDto> CreateAsync(CreateProcedureDocumentDetailsRequestDto dto);
        Task<ProcedureDocumentDetailsResponseDto> UpdateAsync(UpdateProcedureDocumentDetailsRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 