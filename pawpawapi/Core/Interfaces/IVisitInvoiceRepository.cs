using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IVisitInvoiceRepository
    {
        Task<VisitInvoice?> GetByIdAsync(Guid id);
        Task<VisitInvoice?> GetByVisitIdAsync(Guid visitId, Guid? clinicId = null);
        Task<IEnumerable<VisitInvoice>> GetAllAsync(int pageNumber, int pageSize, Guid? visitId = null, Guid? clinicId = null);
        Task<IEnumerable<VisitInvoice>> GetByFiltersAsync(int pageNumber, int pageSize, Guid? patientId = null, string? status = null, string? paymentMethod = null, DateTimeOffset? createdAtFrom = null, DateTimeOffset? createdAtTo = null, Guid? clinicId = null);
        Task<Guid> CreateAsync(VisitInvoice visitInvoice);
        Task<bool> UpdateAsync(VisitInvoice visitInvoice);
        Task<bool> DeleteAsync(Guid id);

        // Products
        Task<IEnumerable<VisitInvoiceProduct>> GetProductsByInvoiceIdAsync(Guid visitInvoiceId);
        Task AddProductsAsync(Guid visitInvoiceId, IEnumerable<VisitInvoiceProduct> products);
        Task DeleteProductsByInvoiceIdAsync(Guid visitInvoiceId);
    }
}
