using Core.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IAppointmentTypeRepository
    {
        Task<IEnumerable<AppointmentType>> GetAllAsync();
        Task<AppointmentType> GetByIdAsync(Guid id);
        Task<AppointmentType> AddAsync(AppointmentType appointmentType);
        Task<AppointmentType> UpdateAsync(AppointmentType appointmentType);
        Task<bool> DeleteAsync(Guid id);
    }
} 