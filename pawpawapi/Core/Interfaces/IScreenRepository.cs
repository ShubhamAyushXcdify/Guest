using Core.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IScreenRepository
    {
        Task<IEnumerable<Screen>> GetAllAsync();
        Task<Screen> GetByIdAsync(Guid id);
        Task<Screen> AddAsync(Screen screen);
        Task<Screen> UpdateAsync(Screen screen);
        Task<bool> DeleteAsync(Guid id);
    }
}
