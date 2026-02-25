using System;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IMedicalHistoryDetailRepository
    {
        Task<MedicalHistoryDetail> CreateAsync(MedicalHistoryDetail medicalHistoryDetail);
        Task<MedicalHistoryDetail> GetByIdAsync(Guid id);
        Task<MedicalHistoryDetail> GetByPatientIdAsync(Guid patientId);
        Task<MedicalHistoryDetail> UpdateAsync(MedicalHistoryDetail medicalHistoryDetail);
        Task<bool> DeleteAsync(Guid id);
    }
} 