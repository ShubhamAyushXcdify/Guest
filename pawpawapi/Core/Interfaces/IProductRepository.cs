using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IProductRepository
    {
        Task<Product?> GetByIdAsync(Guid id);
        Task<(IEnumerable<Product> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            ProductFilter? filter = null);
        Task<Product> AddAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(Guid id);
        Task<object> GetFilterOptionsAsync();
        Task<(IEnumerable<ProductUsageHistoryRow> Items, int TotalCount)> GetUsageHistoryByProductIdAsync(
            Guid productId,
            int pageNumber,
            int pageSize);
    }
} 