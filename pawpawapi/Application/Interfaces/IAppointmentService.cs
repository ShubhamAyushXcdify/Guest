using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IAppointmentService
    {
        Task<AppointmentResponseDto> CreateAsync(CreateAppointmentRequestDto dto);
        Task<AppointmentResponseDto> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<AppointmentResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid? clinicId = null,
            Guid? patientId = null,
            Guid? clientId = null,
            Guid? veterinarianId = null,
            Guid? roomId = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            bool? isRegistered = null,
            Guid? companyId = null);
        Task<AppointmentResponseDto> UpdateAsync(UpdateAppointmentRequestDto dto, bool sendEmail = false);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<AppointmentResponseDto>> GetByPatientIdAsync(Guid patientId);
        Task<AppointmentResponseDto> UpdateRegistrationStatusAsync(Guid id, bool isRegistered);
        Task<IEnumerable<AppointmentResponseDto>> GetByClientIdWithFiltersAsync(Guid clientId, string status, DateTime? fromDate = null, DateTime? toDate = null);
        Task<List<ProviderDashboardSummaryDto>> GetProviderDashboardAsync(DateTime? fromDate, DateTime? toDate, Guid? clinicId = null, Guid? companyId = null);
    }
}