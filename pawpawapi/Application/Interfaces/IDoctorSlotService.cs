using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IDoctorSlotService
    {
        Task<DoctorSlotDto> CreateDoctorSlotAsync(CreateDoctorSlotDto dto);
        Task<DoctorSlotDto> GetDoctorSlotByIdAsync(Guid id);
        Task<IEnumerable<DoctorSlotDto>> GetAllDoctorSlotsAsync();
        Task<DoctorSlotDto> UpdateDoctorSlotAsync(Guid id, UpdateDoctorSlotDto dto);
        Task<bool> DeleteDoctorSlotAsync(Guid id);
    }
}