using System;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface ISurgeryDischargeRepository
    {
        Task<SurgeryDischarge> GetByIdAsync(Guid id);
        Task<SurgeryDischarge> GetByVisitIdAsync(Guid visitId);
        Task<Guid> CreateAsync(SurgeryDischarge discharge);
        Task<bool> UpdateAsync(SurgeryDischarge discharge);
        Task<bool> DeleteAsync(Guid id);
    }
} 