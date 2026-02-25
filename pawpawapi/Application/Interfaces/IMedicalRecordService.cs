using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IMedicalRecordService
    {
        Task<MedicalRecordResponseDto> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<MedicalRecordResponseDto>> GetAllAsync(
            int pageNumber = 1, 
            int pageSize = 10,
            Guid? clinicId = null,
            Guid? patientId = null,
            Guid? appointmentId = null,
            Guid? veterinarianId = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null);
        Task<MedicalRecordResponseDto> CreateAsync(CreateMedicalRecordRequestDto dto);
        Task<MedicalRecordResponseDto> UpdateAsync(UpdateMedicalRecordRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 