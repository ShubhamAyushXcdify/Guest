using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IPatientRepository
    {
        Task<Patient?> GetByIdAsync(Guid id);
        Task<Patient?> GetByMicrochipNumberAsync(string microchipNumber);
        Task<(IEnumerable<Patient> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            Guid? patientId = null,
            Guid? clientId = null,
            Guid? medicalRecordId = null,
            bool paginationRequired = true,
            Guid? companyId = null,
            string? search = null);
        Task<Patient> AddAsync(Patient patient);
        Task<Patient> UpdateAsync(Patient patient);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<Patient>> SearchAsync(string query, string type, int page, int pageSize, Guid? companyId = null);
        Task<object> GetPatientVisitDetailsAsync(Guid patientId);
        Task<IEnumerable<object>> GetPatientWeightHistoryAsync(Guid patientId);
        Task<IEnumerable<object>> GetPatientAppointmentHistoryAsync(Guid patientId, Guid? clinicId = null);
    }
} 