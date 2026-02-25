using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IDischargeSummaryService
    {
        Task<DischargeSummaryResponseDto> GetDischargeSummaryByVisitIdAsync(Guid visitId);
        Task<EmergencyDischargeSummaryResponseDto> GetEmergencyDischargeSummaryByVisitIdAsync(Guid visitId);
        Task<SurgeryDischargeSummaryResponseDto> GetSurgeryDischargeSummaryByVisitIdAsync(Guid visitId);
        Task<DewormingDischargeSummaryResponseDto> GetDewormingDischargeSummaryByVisitIdAsync(Guid visitId);
        Task<VaccinationDischargeSummaryResponseDto> GetVaccinationDischargeSummaryByVisitIdAsync(Guid visitId);
        Task<List<ClientDischargeSummaryResponseDto>> GetClientDischargeSummariesAsync(Guid clientId, DateTime? fromDate = null, DateTime? toDate = null);
    }
} 