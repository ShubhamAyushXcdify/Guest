using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IProcedureRepository
    {
        Task<Procedure> CreateAsync(Procedure procedure);
        Task<IEnumerable<Procedure>> GetAllAsync(string? type = null);
        Task<Procedure> GetByIdAsync(Guid id);
        Task<Procedure> UpdateAsync(Procedure procedure);
        Task<bool> DeleteAsync(Guid id);
    }
} 