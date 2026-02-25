using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IEmergencyVisitRepository
    {
        Task<EmergencyTriage?> GetByIdAsync(Guid id);
        Task<IEnumerable<EmergencyTriage>> GetAllAsync();
        Task AddAsync(EmergencyTriage triage);
        Task UpdateAsync(EmergencyTriage triage);
        Task DeleteAsync(Guid id);
        Task<IEnumerable<EmergencyTriage>> GetByVisitIdAsync(Guid visitId);
    }
} 