using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IScreenService
    {
        Task<ScreenResponseDto> CreateScreenAsync(CreateScreenRequestDto dto);
        Task<ScreenResponseDto> GetScreenByIdAsync(Guid id);
        Task<IEnumerable<ScreenResponseDto>> GetAllScreensAsync();
        Task<ScreenResponseDto> UpdateScreenAsync(Guid id, UpdateScreenRequestDto dto);
        Task<bool> DeleteScreenAsync(Guid id);

        // Screen Access methods
        Task<IEnumerable<ScreenAccessResponseDto>> GetScreenAccessByClinicIdAsync(Guid clinicId, Guid? roleId = null);
        Task<bool> UpdateScreenAccessAsync(UpdateScreenAccessRequestDto dto);
    }
}
