using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IEmergencyDischargeService
    {
        Task<EmergencyDischargeResponseDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<EmergencyDischargeResponseDto>> GetAllAsync();
        Task<IEnumerable<EmergencyDischargeResponseDto>> GetByVisitIdAsync(Guid visitId);
        Task<EmergencyDischargeResponseDto> CreateAsync(CreateEmergencyDischargeRequestDto dto);
        Task<EmergencyDischargeResponseDto> UpdateAsync(UpdateEmergencyDischargeRequestDto dto);
        Task DeleteAsync(Guid id);
        Task<EmergencyDischargeWithPrescriptionsResponseDto?> GetWithPrescriptionsByIdAsync(Guid id);
        Task<IEnumerable<EmergencyDischargeWithPrescriptionsResponseDto>> GetAllWithPrescriptionsByVisitIdAsync(Guid visitId);
        Task<EmergencyDischargeWithPrescriptionsResponseDto> CreateWithPrescriptionsAsync(EmergencyDischargeWithPrescriptionsRequestDto dto);
        Task<EmergencyDischargeWithPrescriptionsResponseDto> UpdateWithPrescriptionsAsync(Guid id, EmergencyDischargeWithPrescriptionsRequestDto dto);
    }
} 