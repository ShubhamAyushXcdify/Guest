using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IDoctorSlotRepository
    {
        Task<DoctorSlot> CreateAsync(DoctorSlot slot);
        Task<DoctorSlot?> GetByIdAsync(Guid id);
        Task<IEnumerable<DoctorSlot>> GetAllAsync();
        Task<DoctorSlot> UpdateAsync(DoctorSlot slot);
        Task<bool> DeleteAsync(Guid id);
    }
}