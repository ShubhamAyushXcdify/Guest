using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IUserService
    {
        Task<UserResponseDto?> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<UserResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid[]? roleIds = null,
            Guid[]? clinicIds = null,
            bool paginationRequired = true, Guid? companyId = null);


        Task<UserResponseDto> CreateAsync(CreateUserRequestDto dto);
        Task<UserResponseDto> UpdateAsync(UpdateUserRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<UserResponseDto?> GetByEmailAsync(string email);
        Task<IEnumerable<UserResponseDto>> GetByClinicIdAsync(Guid clinicId);
        Task<IEnumerable<DoctorSlotDto>> GetAvailableSlotsForVeterinarianAsync(Guid userId, DateTime date);
        Task<IEnumerable<UserSlotDto>> GetAvailableUserSlotsAsync(Guid userId, DateTime? date = null, Guid? clinicId = null);
        Task UpdateUserSlotsAsync(Guid userId, IEnumerable<Guid> slots, Guid? clinicId = null);
        Task<IEnumerable<UserClinicSlotsResponseDto>> GetUserSlotsByClinicAsync(Guid userId, Guid? clinicId = null);
    }
} 