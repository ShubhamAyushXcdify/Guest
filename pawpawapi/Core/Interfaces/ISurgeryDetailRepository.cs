using System;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface ISurgeryDetailRepository
    {
        Task<SurgeryDetail> CreateAsync(SurgeryDetail detail);
        Task<SurgeryDetail?> GetByIdAsync(Guid id);
        Task<SurgeryDetail?> GetByVisitIdAsync(Guid visitId);
        Task<SurgeryDetail> UpdateAsync(SurgeryDetail detail);
        Task<bool> DeleteAsync(Guid id);
    }
} 