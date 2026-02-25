using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IVaccinationMasterRepository
    {
        Task<VaccinationMaster> CreateAsync(VaccinationMaster vaccinationMaster);
        Task<VaccinationMaster?> GetByIdAsync(Guid id);
        Task<IEnumerable<VaccinationMaster>> GetAllAsync(string? species = null, bool? isCore = null);
        Task<VaccinationMaster> UpdateAsync(VaccinationMaster vaccinationMaster);
        Task<bool> DeleteAsync(Guid id);
    }
} 