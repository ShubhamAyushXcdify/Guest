using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IVisitService
    {
        Task<VisitResponseDto?> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<VisitResponseDto>> GetAllAsync(int pageNumber = 1, int pageSize = 10, bool paginationRequired = true);
        Task<VisitResponseDto> CreateAsync(CreateVisitRequestDto dto);
        Task<VisitResponseDto> UpdateAsync(Guid id, UpdateVisitRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<VisitResponseDto?> GetByAppointmentIdAsync(Guid appointmentId);
        Task<VisitResponseDto?> GetByPatientIdAsync(Guid patientId);
    }
} 