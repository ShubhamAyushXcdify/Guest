using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPatientFileService
    {
        Task<PatientFileResponseDto> GetByIdAsync(Guid id);
        Task<IEnumerable<PatientFileResponseDto>> GetByPatientIdAsync(Guid patientId);
        Task<IEnumerable<PatientFileResponseDto>> GetByVisitIdAsync(Guid visitId);
        Task<PatientFileResponseDto> CreateAsync(CreatePatientFileRequestDto dto);
        Task<PatientFileResponseDto> UpdateAsync(UpdatePatientFileRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> DeleteByVisitIdAsync(Guid visitId);
        Task<DeletePatientFileResponseDto> DeleteAttachmentAsync(Guid attachmentId);
    }
}

