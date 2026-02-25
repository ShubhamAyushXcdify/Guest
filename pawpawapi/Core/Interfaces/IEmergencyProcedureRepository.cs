using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IEmergencyProcedureRepository
    {
        Task<EmergencyProcedure?> GetByIdAsync(Guid id);
        Task<IEnumerable<EmergencyProcedure>> GetAllAsync();
        Task<IEnumerable<EmergencyProcedure>> GetByVisitIdAsync(Guid visitId);
        Task AddAsync(EmergencyProcedure procedure);
        Task UpdateAsync(EmergencyProcedure procedure);
        Task DeleteAsync(Guid id);
    }
} 