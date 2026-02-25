using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IMedicalHistoryDetailService
    {
        Task<MedicalHistoryDetailResponseDto> GetByIdAsync(Guid id);
        Task<MedicalHistoryDetailResponseDto> GetByPatientIdAsync(Guid patientId);
        Task<MedicalHistoryDetailResponseDto> CreateAsync(CreateMedicalHistoryDetailRequestDto dto);
        Task<MedicalHistoryDetailResponseDto> UpdateAsync(UpdateMedicalHistoryDetailRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 