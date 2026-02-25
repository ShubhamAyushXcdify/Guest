using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IInventoryRepository
    {
        Task<Inventory> GetByIdAsync(Guid id);
        Task<(IEnumerable<Inventory> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            Guid? productId = null,
            Guid? clinicId = null,
            string? search = null,
            string? productType = null,
            string? lotNumber = null,
            int? quantityOnHand = null,
            int? quantityReserved = null,
            int? reorderLevel = null,
            int? reorderQuantity = null,
            decimal? unitCost = null,
            decimal? wholesaleCost = null,
            decimal? retailPrice = null,
            string? location = null,
            string? unitOfMeasure = null,
            int? unitsPerPackage = null,
            string? batchNumber = null,
            bool? receivedFromPo = null,
            Guid? poItemId = null
        );
        Task<int> GetCountAsync(Guid clinicId);
        Task<IEnumerable<Inventory>> GetLowStockProductsAsync(Guid clinicId);
        Task<IEnumerable<Inventory>> GetExpiringSoonProductsAsync(Guid clinicId);
        Task<IEnumerable<Inventory>> GetProductsExpiringWithin3MonthsAsync(Guid? clinicId = null);
        Task AddAsync(Inventory inventory);
        Task<Inventory> UpdateAsync(Inventory inventory);
        Task<bool> DeleteAsync(Guid id);
        
        // New methods for PO receiving inventory management
        Task<Inventory?> GetByProductAndBatchAsync(Guid productId, Guid clinicId, string? lotNumber, string? batchNumber);
        Task<Inventory?> GetByPoItemAsync(Guid poItemId);
        Task<IEnumerable<Inventory>> GetByProductAndBatchRangeAsync(Guid productId, Guid clinicId, string? lotNumber = null, string? batchNumber = null);
        
        // Product type-ahead search method
        Task<IEnumerable<Inventory>> SearchProductsByTypeAheadAsync(Guid clinicId, string searchTerm, int limit = 10);
        Task<IEnumerable<Inventory>> SearchProductsByClinicAsync(Guid clinicId, string searchTerm);
    }
}