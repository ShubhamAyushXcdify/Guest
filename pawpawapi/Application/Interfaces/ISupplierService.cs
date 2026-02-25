using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface ISupplierService
    {
        Task<SupplierResponseDto?> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<SupplierResponseDto>> GetAllAsync(SupplierFilterDto filter);
        Task<SupplierResponseDto> CreateAsync(CreateSupplierRequestDto dto);
        Task<SupplierResponseDto> UpdateAsync(UpdateSupplierRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
