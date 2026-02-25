using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IInventoryService
    {
        Task<InventoryResponseDto?> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<InventoryResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
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
        Task<InventoryResponseDto> CreateAsync(CreateInventoryRequestDto dto);
        Task<InventoryDashboardResponseDto> GetInventoryDashboardAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<InventoryResponseDto> UpdateAsync(UpdateInventoryRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
        
        // New methods for PO receiving inventory management
        Task<InventoryResponseDto> AddInventoryFromPoReceivingAsync(
            Guid clinicId,
            Guid productId,
            string? lotNumber,
            string? batchNumber,
            DateTime? expirationDate,
            DateTime? dateOfManufacture,
            int quantityReceived,
            decimal? unitCost,
            string? unitOfMeasure,
            int? unitsPerPackage,
            Guid poItemId,
            Guid? supplierId // Added for supplier tracking
        );
        
        Task<IEnumerable<InventoryResponseDto>> GetInventoryByProductAndBatchAsync(
            Guid productId,
            Guid clinicId,
            string? lotNumber = null,
            string? batchNumber = null);
        
        Task<InventoryResponseDto?> GetInventoryByPoItemAsync(Guid poItemId);
        
        // Product type-ahead search method
        Task<IEnumerable<InventoryResponseDto>> SearchProductsByTypeAheadAsync(
            Guid clinicId,
            string searchTerm,
            int limit = 10
        );
        
        // Product search by clinic without limit
        Task<IEnumerable<InventoryResponseDto>> SearchProductsByClinicAsync(
            Guid clinicId,
            string searchTerm
        );
    }
}
