using System;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IProcedureDocumentDetailsRepository
    {
        Task<ProcedureDetailMapping> GetByIdAsync(Guid id);
        Task<ProcedureDetailMapping> GetByVisitAndProcedureAsync(Guid visitId, Guid procedureId);
        Task<ProcedureDetailMapping> CreateAsync(ProcedureDetailMapping mapping);
        Task<ProcedureDetailMapping> UpdateAsync(ProcedureDetailMapping mapping);
        Task<bool> DeleteAsync(Guid id);
    }
} 