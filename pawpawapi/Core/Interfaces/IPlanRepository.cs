using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IPlanRepository
    {
        Task<Plan> CreateAsync(Plan plan);
        Task<IEnumerable<Plan>> GetAllAsync();
        Task<Plan> GetByIdAsync(Guid id);
        Task<Plan> UpdateAsync(Plan plan);
        Task<bool> DeleteAsync(Guid id);
    }
} 