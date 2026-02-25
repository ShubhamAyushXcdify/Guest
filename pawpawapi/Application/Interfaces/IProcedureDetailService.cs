using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IProcedureDetailService
    {
        Task<ProcedureDetailResponseDto> GetByIdAsync(Guid id);
        Task<ProcedureDetailResponseDto> GetByVisitIdAsync(Guid visitId);
        Task<ProcedureDetailResponseDto> CreateAsync(CreateProcedureDetailRequestDto dto);
        Task<ProcedureDetailResponseDto> UpdateAsync(UpdateProcedureDetailRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 