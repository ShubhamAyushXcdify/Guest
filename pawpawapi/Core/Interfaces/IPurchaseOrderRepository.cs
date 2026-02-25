using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IPurchaseOrderRepository
    {
        Task<PurchaseOrder?> GetByIdAsync(Guid id);
          Task<IEnumerable<PurchaseOrder>> GetAllAsync(
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

        Task<PaginatedResponse<PurchaseOrder>> GetAllPagedAsync(
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
        Task AddAsync(PurchaseOrder purchaseOrder);
        Task UpdateAsync(PurchaseOrder purchaseOrder);
        Task DeleteAsync(Guid id);
        Task<string> GenerateOrderNumberAsync();
        
        // Receiving methods
        Task<PurchaseOrder?> GetByOrderNumberAsync(string orderNumber);
        Task<IEnumerable<PurchaseOrder>> GetPendingReceivingAsync();
    }
} 