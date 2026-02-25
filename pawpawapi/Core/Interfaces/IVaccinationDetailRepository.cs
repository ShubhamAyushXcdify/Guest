using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IVaccinationDetailRepository
    {
        Task<VaccinationDetail> CreateAsync(VaccinationDetail detail);
        Task<IEnumerable<VaccinationDetail>> CreateManyAsync(IEnumerable<VaccinationDetail> details);
        Task<VaccinationDetail?> GetByIdAsync(Guid id);
        Task<IEnumerable<VaccinationDetail>> GetByVisitIdAsync(Guid visitId);
        Task<VaccinationDetail> UpdateAsync(VaccinationDetail detail);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> UpdateVaccinationJsonAsync(Guid vaccinationDetailId, Guid vaccinationMasterId, string vaccinationJson);
        Task<string?> GetVaccinationJsonAsync(Guid vaccinationDetailId, Guid vaccinationMasterId);
    }
} 