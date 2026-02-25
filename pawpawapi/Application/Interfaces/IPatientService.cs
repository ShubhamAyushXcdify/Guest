using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPatientService
    {
        Task<PatientResponseDto?> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<PatientResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid? patientId = null,
            Guid? clientId = null,
            Guid? medicalRecordId = null,
            bool paginationRequired = true,
            Guid? companyId = null,
            string? search = null);
        Task<PatientResponseDto> CreateAsync(CreatePatientRequestDto dto);
        Task<PatientResponseDto> UpdateAsync(UpdatePatientRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<PatientResponseDto>> SearchAsync(string query, string type, int page = 1, int pageSize = 20, Guid? companyId = null);
        Task<PatientVisitDetailsResponseDto> GetPatientVisitDetailsAsync(Guid patientId);
        Task<PatientWeightHistoryResponseDto> GetPatientWeightHistoryAsync(Guid patientId);
        Task<PatientAppointmentHistoryResponseDto> GetPatientAppointmentHistoryAsync(Guid patientId, Guid? clinicId = null);
    }
} 