using System;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IPrescriptionDetailRepository
    {
        Task<PrescriptionDetail> CreateAsync(PrescriptionDetail prescriptionDetail);
        Task<PrescriptionDetail> GetByIdAsync(Guid id);
        Task<PrescriptionDetail> GetByVisitIdAsync(Guid visitId);
        Task<PrescriptionDetail> UpdateAsync(PrescriptionDetail prescriptionDetail);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> AddProductMappingAsync(Guid prescriptionDetailId, PrescriptionProductMapping mapping);
        Task<bool> RemoveProductMappingAsync(Guid prescriptionDetailId, Guid productId);
        Task<bool> RestoreInventoryForMappingAsync(PrescriptionProductMapping mapping);
        Task<ICollection<PrescriptionProductMapping>> GetProductMappingsAsync(Guid prescriptionDetailId);
        Task<ICollection<PrescriptionProductMappingWithProduct>> GetProductMappingsWithProductAsync(Guid prescriptionDetailId);
        Task<List<PrescriptionDetailFlatResult>> GetPrescriptionDetailsByPatientIdAsync(Guid patientId);
    }
} 