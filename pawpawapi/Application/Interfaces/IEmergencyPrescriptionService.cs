using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IEmergencyPrescriptionService
    {
        Task<EmergencyPrescriptionResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<EmergencyPrescriptionResponseDto>> GetAllAsync();
        Task<IEnumerable<EmergencyPrescriptionResponseDto>> GetByVisitIdAsync(Guid visitId);
        Task<IEnumerable<EmergencyPrescriptionResponseDto>> GetByDischargeIdAsync(Guid dischargeId);
        Task<EmergencyPrescriptionResponseDto> CreateAsync(CreateEmergencyPrescriptionRequestDto dto);
        Task<EmergencyPrescriptionResponseDto> UpdateAsync(UpdateEmergencyPrescriptionRequestDto dto);
        Task DeleteAsync(Guid id);
    }
} 