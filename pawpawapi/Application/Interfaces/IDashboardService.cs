using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetDashboardSummaryAsync(DateTime? fromDate = null, DateTime? toDate = null, Guid? companyId = null);
        Task<SuperAdminDashboardDto> GetSuperAdminDashboardAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<ClinicAdminDashboardDto> GetClinicAdminDashboardAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<VeterinarianDashboardDto> GetVeterinarianDashboardAsync(Guid userId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<ReceptionistDashboardDto> GetReceptionistDashboardAsync(Guid userId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<ExpiringProductsResponseDto>> GetProductsExpiringWithin3MonthsAsync(Guid? clinicId = null);
        Task<ClinicWeeklyProfitResponseDto> GetClinicWeeklyProfitAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null);
    }
} 