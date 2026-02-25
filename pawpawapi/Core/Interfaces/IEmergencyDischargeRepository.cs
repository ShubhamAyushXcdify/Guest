using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IEmergencyDischargeRepository
    {
        Task<EmergencyDischarge?> GetByIdAsync(Guid id);
        Task<IEnumerable<EmergencyDischarge>> GetAllAsync();
        Task<IEnumerable<EmergencyDischarge>> GetByVisitIdAsync(Guid visitId);
        Task AddAsync(EmergencyDischarge discharge);
        Task UpdateAsync(EmergencyDischarge discharge);
        Task DeleteAsync(Guid id);
    }
} 