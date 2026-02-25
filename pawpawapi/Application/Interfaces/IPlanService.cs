using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPlanService
    {
        Task<PlanResponseDto> CreateAsync(CreatePlanRequestDto request);
        Task<IEnumerable<PlanResponseDto>> GetAllAsync();
        Task<PlanResponseDto> GetByIdAsync(Guid id);
        Task<PlanResponseDto> UpdateAsync(UpdatePlanRequestDto request);
        Task<bool> DeleteAsync(Guid id);
    }
} 