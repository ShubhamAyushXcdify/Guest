using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IMedicalRecordRepository
    {
        Task<MedicalRecord> CreateAsync(MedicalRecord medicalRecord);
        Task<MedicalRecord> GetByIdAsync(Guid id);
        Task<(IEnumerable<MedicalRecord> Items, int TotalCount)> GetAllAsync(
            int pageNumber, 
            int pageSize,
            Guid? clinicId = null,
            Guid? patientId = null,
            Guid? appointmentId = null,
            Guid? veterinarianId = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null);
        Task<MedicalRecord> UpdateAsync(MedicalRecord medicalRecord);
        Task<bool> DeleteAsync(Guid id);
    }
} 