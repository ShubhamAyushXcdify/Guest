using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IRoleRepository
    {
        Task<Role> CreateAsync(Role role);
        Task<Role?> GetByIdAsync(Guid id);
        Task<IEnumerable<Role>> GetAllAsync();
        Task<Role> UpdateAsync(Role role);
        Task<bool> DeleteAsync(Guid id);
    }
} 