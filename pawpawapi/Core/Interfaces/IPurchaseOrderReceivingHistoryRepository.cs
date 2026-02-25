using Core.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IPurchaseOrderReceivingHistoryRepository
    {
        Task<IEnumerable<PurchaseOrderReceivingHistory>> GetAllAsync();
        Task<PurchaseOrderReceivingHistory> GetByIdAsync(Guid id);
        Task<IEnumerable<PurchaseOrderReceivingHistory>> GetByPurchaseOrderIdAsync(Guid purchaseOrderId);
        Task<IEnumerable<PurchaseOrderReceivingHistory>> GetByProductIdAsync(Guid productId);
        Task<IEnumerable<PurchaseOrderReceivingHistory>> GetByClinicIdAsync(Guid clinicId, string? productName = null, Guid? companyId = null);
        Task<IEnumerable<PurchaseOrderReceivingHistory>> GetByProductAndClinicAsync(Guid productId, Guid clinicId);
        Task<PurchaseOrderReceivingHistory?> GetByProductAndBatchAsync(Guid productId, Guid clinicId, string batchNumber);
        Task<PurchaseOrderReceivingHistory> GetByBarcodeAsync(string barcode);
        Task<PurchaseOrderReceivingHistory> AddAsync(PurchaseOrderReceivingHistory history);
        Task<PurchaseOrderReceivingHistory> UpdateAsync(PurchaseOrderReceivingHistory history);
        Task<bool> DeleteAsync(Guid id);
    }
}
