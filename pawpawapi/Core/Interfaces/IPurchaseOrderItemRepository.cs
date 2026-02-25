using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IPurchaseOrderItemRepository
    {
        Task<PurchaseOrderItem?> GetByIdAsync(Guid id);
        Task<IEnumerable<PurchaseOrderItem>> GetAllAsync();
        Task<IEnumerable<PurchaseOrderItem>> GetByPurchaseOrderIdAsync(Guid purchaseOrderId);
        Task AddAsync(PurchaseOrderItem purchaseOrderItem);
        Task UpdateAsync(PurchaseOrderItem purchaseOrderItem);
        Task DeleteAsync(Guid id);
        Task DeleteByPurchaseOrderIdAsync(Guid purchaseOrderId);
    }
} 