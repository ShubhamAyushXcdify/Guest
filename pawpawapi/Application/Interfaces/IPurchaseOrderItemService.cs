using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPurchaseOrderItemService
    {
        Task<PurchaseOrderItemResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<PurchaseOrderItemResponseDto>> GetAllAsync();
        Task<PurchaseOrderItemResponseDto> CreateAsync(CreatePurchaseOrderItemRequestDto dto);
        Task<PurchaseOrderItemResponseDto> UpdateAsync(UpdatePurchaseOrderItemRequestDto dto);
        Task DeleteAsync(Guid id);
    }
} 