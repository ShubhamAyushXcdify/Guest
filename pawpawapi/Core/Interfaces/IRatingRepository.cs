using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IRatingRepository
    {
        Task<Rating> CreateAsync(Rating rating);
        Task<Rating> GetByIdAsync(Guid id);
        Task<IEnumerable<Rating>> GetAllAsync();
        Task<Rating> UpdateAsync(Rating rating);
        Task<bool> DeleteAsync(Guid id);
    }
}
