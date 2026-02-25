using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IProcedureDetailRepository
    {
        Task<ProcedureDetail> CreateAsync(ProcedureDetail procedureDetail);
        Task<ProcedureDetail> GetByIdAsync(Guid id);
        Task<ProcedureDetail> GetByVisitIdAsync(Guid visitId);
        Task<ProcedureDetail> UpdateAsync(ProcedureDetail procedureDetail);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> AddProcedureAsync(Guid procedureDetailId, Guid procedureId);
        Task<bool> RemoveProcedureAsync(Guid procedureDetailId, Guid procedureId);
    }
} 