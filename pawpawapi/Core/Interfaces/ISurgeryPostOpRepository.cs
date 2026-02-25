using System;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface ISurgeryPostOpRepository
    {
        Task<SurgeryPostOp> GetByIdAsync(Guid id);
        Task<SurgeryPostOp> GetByVisitIdAsync(Guid visitId);
        Task<Guid> CreateAsync(SurgeryPostOp postOp);
        Task<bool> UpdateAsync(SurgeryPostOp postOp);
        Task<bool> DeleteAsync(Guid id);
    }
} 