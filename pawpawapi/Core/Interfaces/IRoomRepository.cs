using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IRoomRepository
    {
        Task<Room?> GetByIdAsync(Guid id);
        Task<(IEnumerable<Room> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            Guid? clinicId = null,
            bool paginationRequired = true);
        Task<IEnumerable<Room>> GetByClinicIdAsync(Guid clinicId);
        Task<Room> AddAsync(Room room);
        Task<Room> UpdateAsync(Room room);
        Task<bool> DeleteAsync(Guid id);
    }
} 