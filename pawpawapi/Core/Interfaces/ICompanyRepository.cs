using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface ICompanyRepository
    {
        Task<bool> ExistsActiveByNameAsync(string name);
        Task<Company> CreateAsync(Company company);
        Task<Company?> GetByIdAsync(Guid id);
        Task<IEnumerable<Company>> GetAllAsync();
        Task<(IEnumerable<Company> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            bool paginationRequired = true,
            string? companyName = null);
        Task<Company> UpdateAsync(Company company);
        Task<bool> DeleteAsync(Guid id);
    }
}
