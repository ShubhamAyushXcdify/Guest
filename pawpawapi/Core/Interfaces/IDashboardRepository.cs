using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IDashboardRepository
    {
        Task<double?> GetAverageRatingByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<double?> GetAverageRatingByClinicAsync(Guid? clinicId, DateTime? fromDate = null, DateTime? toDate = null);

        /// <summary>Returns all super-admin dashboard data in one query (companies, clinics, all counts).</summary>
        Task<IReadOnlyList<SuperAdminDashboardRow>> GetSuperAdminDashboardSingleQueryAsync(DateTime? fromDate = null, DateTime? toDate = null);

        // Count methods with date filtering
        Task<int> GetVeterinarianCountByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<int> GetPatientCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<int> GetClientCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<int> GetActiveClientCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<int> GetNewClientCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<int> GetMovedOutClientCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<int> GetNewClientCountByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<int> GetMovedOutClientCountByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<int> GetPendingRegistrationCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<int> GetProductCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<int> GetSupplierCountByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null);

        // Appointment statistics
        Task<(int Total, int Completed, int Canceled)> GetAppointmentStatisticsByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null);
        
        // Profit calculations
        Task<decimal> GetServiceProfitByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<decimal> GetProductProfitByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<decimal> GetServiceProfitByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<decimal> GetProductProfitByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null);
        
        // Weekly profit calculations
        Task<IEnumerable<(DateTime WeekStart, DateTime WeekEnd, decimal ServiceProfit, decimal ProductProfit)>> GetWeeklyProfitByClinicAsync(Guid clinicId, DateTime fromDate, DateTime toDate);
    }
}

