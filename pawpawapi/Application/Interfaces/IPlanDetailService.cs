using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPlanDetailService
    {
        Task<PlanDetailResponseDto> GetByIdAsync(Guid id);
        Task<PlanDetailResponseDto> GetByVisitIdAsync(Guid visitId);
        Task<PlanDetailResponseDto> CreateAsync(CreatePlanDetailRequestDto dto);
        Task<PlanDetailResponseDto> UpdateAsync(UpdatePlanDetailRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 