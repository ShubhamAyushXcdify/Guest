using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IDewormingMedicationRepository
    {
        Task<DewormingMedication?> GetByIdAsync(Guid id);
        Task<IEnumerable<DewormingMedication>> GetByVisitIdAsync(Guid visitId);
        Task<DewormingMedication> CreateAsync(DewormingMedication medication);
        Task<DewormingMedication> UpdateAsync(DewormingMedication medication);
        Task<bool> DeleteAsync(Guid id);
    }
} 