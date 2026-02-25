using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IRoomService
    {
        Task<RoomResponseDto?> GetByIdAsync(Guid id);
        Task<PaginatedResponseDto<RoomResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid? clinicId = null,
            bool paginationRequired = true);
        Task<IEnumerable<RoomResponseDto>> GetByClinicIdAsync(Guid clinicId);
        Task<RoomResponseDto> CreateAsync(CreateRoomRequestDto dto);
        Task<RoomResponseDto> UpdateAsync(UpdateRoomRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 