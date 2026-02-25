using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IEmergencyVitalRepository
    {
        Task<EmergencyVital?> GetByIdAsync(Guid id);
        Task<IEnumerable<EmergencyVital>> GetAllAsync();
        Task<IEnumerable<EmergencyVital>> GetByVisitIdAsync(Guid visitId);
        Task AddAsync(EmergencyVital vital);
        Task UpdateAsync(EmergencyVital vital);
        Task DeleteAsync(Guid id);
    }
} 