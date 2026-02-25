using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface ISurgeryPreOpRepository
    {
        Task<SurgeryPreOp> CreateAsync(SurgeryPreOp preOp);
        Task<SurgeryPreOp?> GetByIdAsync(Guid id);
        Task<SurgeryPreOp?> GetByVisitIdAsync(Guid visitId);
        Task<SurgeryPreOp> UpdateAsync(SurgeryPreOp preOp);
        Task<bool> DeleteAsync(Guid id);
    }
} 