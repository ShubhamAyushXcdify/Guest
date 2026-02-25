using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IVisitInvoiceService
    {
        Task<VisitInvoiceResponseDto?> GetByIdAsync(Guid id);
        Task<VisitInvoiceResponseDto?> GetByVisitIdAsync(Guid visitId, Guid? clinicId = null);
        Task<PaginatedResponseDto<VisitInvoiceResponseDto>> GetAllAsync(int pageNumber = 1, int pageSize = 10, Guid? visitId = null, Guid? clinicId = null);
        Task<PaginatedResponseDto<VisitInvoiceResponseDto>> GetByFiltersAsync(int pageNumber = 1, int pageSize = 10, Guid? patientId = null, string? status = null, string? paymentMethod = null, DateTimeOffset? createdAtFrom = null, DateTimeOffset? createdAtTo = null, Guid? clinicId = null);
        Task<VisitInvoiceResponseDto> CreateAsync(CreateVisitInvoiceRequestDto dto);
        Task<VisitInvoiceResponseDto> UpdateAsync(Guid id, UpdateVisitInvoiceRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
