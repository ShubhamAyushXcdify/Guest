using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IUserClinicRepository
    {
        Task<UserClinic?> GetByIdAsync(Guid id);
        Task<(IEnumerable<UserClinic> Items, int TotalCount)> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid? clinicId = null);
        Task<UserClinic> AddAsync(UserClinic userClinic);
        Task<UserClinic> UpdateAsync(UserClinic userClinic);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<UserClinic>> GetByUserIdAsync(Guid userId);
    }
} 