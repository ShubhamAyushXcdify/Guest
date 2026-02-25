using System;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPrescriptionDetailService
    {
        Task<PrescriptionDetailResponseDto> GetByIdAsync(Guid id);
        Task<PrescriptionDetailResponseDto> GetByVisitIdAsync(Guid visitId);
        Task<PrescriptionDetailResponseDto> CreateAsync(CreatePrescriptionDetailRequestDto dto);
        Task<PrescriptionDetailResponseDto> UpdateAsync(UpdatePrescriptionDetailRequestDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<object> DebugInventoryAsync(Guid purchaseOrderReceivingHistoryId);
        Task<List<PrescriptionDetailFullResponseDto>> GetByPatientIdAsync(Guid patientId);
        Task<PrescriptionPdfResponseDto> GeneratePrescriptionPdfAsync(Guid visitId);
    }
} 