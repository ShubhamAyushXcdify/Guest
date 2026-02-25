using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IEmergencyPrescriptionRepository
    {
        Task<EmergencyPrescription?> GetByIdAsync(Guid id);
        Task<IEnumerable<EmergencyPrescription>> GetAllAsync();
        Task<IEnumerable<EmergencyPrescription>> GetByVisitIdAsync(Guid visitId);
        Task<IEnumerable<EmergencyPrescription>> GetByDischargeIdAsync(Guid dischargeId);
        Task AddAsync(EmergencyPrescription prescription);
        Task UpdateAsync(EmergencyPrescription prescription);
        Task DeleteAsync(Guid id);
    }
} 