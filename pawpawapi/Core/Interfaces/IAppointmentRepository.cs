using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IAppointmentRepository
    {
        Task<Appointment> CreateAsync(Appointment appointment);
        Task<Appointment> GetByIdAsync(Guid id);
        Task<(IEnumerable<Appointment> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            Guid? clinicId = null,
            Guid? patientId = null,
            Guid? clientId = null,
            Guid? veterinarianId = null,
            Guid? roomId = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            bool? isRegistered = null,
            Guid? companyId = null);
        Task<Appointment> UpdateAsync(Appointment appointment);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<Appointment>> GetByPatientIdAsync(Guid patientId);
        Task<IEnumerable<Appointment>> GetByClientIdWithFiltersAsync(Guid clientId, string status, DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Appointment>> GetByVeterinarianAndDateAsync(Guid veterinarianId, DateTime date);
        Task<IEnumerable<(Guid ProviderId, int Total, int Done, int Pending)>> GetProviderAppointmentCountsAsync(DateTime? fromDate, DateTime? toDate, Guid? clinicId = null);
    }
}