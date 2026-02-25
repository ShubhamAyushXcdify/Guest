using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IProductService
    {
        Task<ProductResponseDto?> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<ProductResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            ProductFilterDto? filter = null);
        Task<ProductResponseDto> CreateAsync(CreateProductRequestDto dto);
        Task<ProductResponseDto> UpdateAsync(UpdateProductRequestDto dto);
        Task DeleteAsync(Guid id);
        Task<object> GetFilterOptionsAsync();
        Task<PaginatedResponseDto<ProductUsageHistoryItemDto>> GetUsageHistoryByProductIdAsync(
            Guid productId,
            int pageNumber = 1,
            int pageSize = 10);
    }
} 