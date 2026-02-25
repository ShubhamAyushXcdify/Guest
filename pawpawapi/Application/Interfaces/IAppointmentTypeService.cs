using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IAppointmentTypeService
    {
        Task<AppointmentTypeResponseDto> CreateAppointmentTypeAsync(CreateAppointmentTypeRequestDto dto);
        Task<AppointmentTypeResponseDto> GetAppointmentTypeByIdAsync(Guid id);
        Task<IEnumerable<AppointmentTypeResponseDto>> GetAllAppointmentTypesAsync();
        Task<AppointmentTypeResponseDto> UpdateAppointmentTypeAsync(Guid id, UpdateAppointmentTypeRequestDto dto);
        Task<bool> DeleteAppointmentTypeAsync(Guid id);
    }
}