using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IPlanDetailRepository
    {
        Task<PlanDetail> CreateAsync(PlanDetail planDetail);
        Task<PlanDetail> GetByIdAsync(Guid id);
        Task<PlanDetail> GetByVisitIdAsync(Guid visitId);
        Task<PlanDetail> UpdateAsync(PlanDetail planDetail);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> AddPlanAsync(Guid planDetailId, Guid planId);
        Task<bool> RemovePlanAsync(Guid planDetailId, Guid planId);
    }
} 