using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPatientReportService
    {
        Task<PatientReportResponseDto> GetByIdAsync(Guid id);
        Task<IEnumerable<PatientReportResponseDto>> GetByPatientIdAsync(Guid patientId);
        Task<IEnumerable<PatientReportResponseDto>> GetByDoctorIdAsync(Guid doctorId);
        Task<PatientReportResponseDto> CreateAsync(CreatePatientReportRequestDto dto);
        Task<PatientReportResponseDto> UpdateAsync(UpdatePatientReportRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}

