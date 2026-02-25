using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IClinicRepository
    {
        Task<Clinic?> GetByIdAsync(Guid id);
        Task<(IEnumerable<Clinic> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            bool paginationRequired = true,
            Guid? companyId = null,
            Guid? userId = null,
            string? name = null,
            string? city = null,
            string? state = null,
            string? country = null,
            string? phone = null,
            string? email = null);
        Task<Clinic> AddAsync(Clinic clinic);
        Task<Clinic> UpdateAsync(Clinic clinic);
        Task<bool> DeleteAsync(Guid id);
    }
}
