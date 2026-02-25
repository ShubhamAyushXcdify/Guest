using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.DTOs;
using Core.Models;

namespace Core.Interfaces
{
    public interface ISupplierRepository
    {
        Task<Supplier?> GetByIdAsync(Guid id);
        Task<(IEnumerable<Supplier> Items, int TotalCount)> GetAllAsync(SupplierFilterCoreDto filter);
        Task<Supplier> AddAsync(Supplier supplier);
        Task<Supplier> UpdateAsync(Supplier supplier);
        Task<bool> DeleteAsync(Guid id);
    }
}
