using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IUserClinicService
    {
        Task<UserClinicResponseDto?> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<UserClinicResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid? clinicId = null);
        Task<UserClinicResponseDto> CreateAsync(CreateUserClinicRequestDto dto);
        Task<UserClinicResponseDto> UpdateAsync(UpdateUserClinicRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<UserClinicResponseDto>> GetByUserIdAsync(Guid userId);
    }
} 