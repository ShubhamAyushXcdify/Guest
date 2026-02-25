using Application.DTOs;
using Core.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IPurchaseOrderService
    {
        Task<PurchaseOrderResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<PurchaseOrderResponseDto>> GetAllAsync(
             Guid? clinicId = null,
             DateTime? dateFrom = null,
             DateTime? dateTo = null,
             Guid? supplierId = null,
             IEnumerable<string>? status = null,
             string? orderNumber = null,
             Guid? createdBy = null,
             DateTime? expectedDeliveryFrom = null,
             DateTime? expectedDeliveryTo = null,
             DateTime? actualDeliveryFrom = null,
             DateTime? actualDeliveryTo = null);

        Task<PaginatedResponse<PurchaseOrderResponseDto>> GetAllPagedAsync(
        Guid? clinicId = null,
        DateTime? dateFrom = null,
        DateTime? dateTo = null,
        Guid? supplierId = null,
        IEnumerable<string>? status = null,
        string? orderNumber = null,
        Guid? createdBy = null,
        DateTime? expectedDeliveryFrom = null,
        DateTime? expectedDeliveryTo = null,
        DateTime? actualDeliveryFrom = null,
        DateTime? actualDeliveryTo = null,
        int page = 1,
        int pageSize = 10);
        Task<PurchaseOrderResponseDto> CreateAsync(CreatePurchaseOrderRequestDto dto);
        Task<PurchaseOrderResponseDto> UpdateAsync(UpdatePurchaseOrderRequestDto dto);
        Task DeleteAsync(Guid id);
        Task<IEnumerable<PurchaseOrderItemResponseDto>> GetItemsByPurchaseOrderIdAsync(Guid purchaseOrderId);
        Task<PurchaseOrderItemResponseDto?> GetItemByIdAsync(Guid itemId);
        
        // Receiving methods
        Task<IEnumerable<PurchaseOrderResponseDto>> GetPendingReceivingAsync();
        Task<PurchaseOrderResponseDto?> GetByOrderNumberAsync(string orderNumber);
        Task<PurchaseOrderResponseDto> ReceiveItemsAsync(ReceivePurchaseOrderRequestDto dto);
        Task<IEnumerable<PurchaseOrderReceivingHistoryDto>> GetReceivingHistoryAsync(string orderNumber);
        Task<PurchaseOrderItemResponseDto> UpdateReceivedItemAsync(UpdateReceivedItemRequestDto dto);
        
        // New methods for receiving history
        Task<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>> GetReceivingHistoryByProductAsync(Guid productId);
        Task<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>> GetReceivingHistoryByClinicAsync(Guid clinicId, string? productName = null, Guid? companyId = null);
        Task<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>> GetReceivingHistoryByProductAndClinicAsync(Guid productId, Guid clinicId);
        Task<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>> GetAllReceivingHistoryAsync();
        Task<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>> GetReceivingHistoryFilteredAsync(PurchaseOrderReceivingHistoryFilterDto filter);
        Task<PurchaseOrderReceivingHistoryResponseDto> GetReceivingHistoryByIdAsync(Guid id);
        Task<PurchaseOrderReceivingHistoryResponseDto> UpdateReceivingHistoryAsync(Guid id, UpdatePurchaseOrderReceivingHistoryDto dto);
        Task<PurchaseOrderReceivingHistoryResponseDto> PatchReceivingHistoryAsync(Guid id, PatchPurchaseOrderReceivingHistoryDto dto);
        
        // Barcode methods
        Task<BarcodeScanResponseDto?> GetByBarcodeAsync(string barcode);
    }
}
