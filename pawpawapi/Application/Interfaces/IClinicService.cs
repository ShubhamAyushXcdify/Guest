using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IClinicService
    {
        Task<ClinicResponseDto> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<ClinicResponseDto>> GetAllAsync(int pageNumber, int pageSize, bool paginationRequired, ClinicFilterDto filter);
        Task<ClinicResponseDto> CreateAsync(CreateClinicRequestDto dto);
        Task<ClinicResponseDto> UpdateAsync(UpdateClinicRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
