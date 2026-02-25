using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ICertificateService
    {
        Task<CertificatesByVisitResponseDto> CreateCertificatesAsync(CreateCertificateRequestDto dto);
        Task<CertificateResponseDto> GetCertificateByIdAsync(Guid id);
        Task<IEnumerable<CertificateResponseDto>> GetAllCertificatesAsync();
        Task<CertificatesByVisitResponseDto> GetCertificatesByVisitIdAsync(Guid visitId);
        Task<CertificatesByVisitResponseDto> UpdateCertificatesAsync(UpdateCertificateRequestDto dto);
        Task<CertificateResponseDto> UpdateCertificateAsync(Guid id, UpdateCertificateItemRequestDto dto);
        Task<bool> DeleteCertificateAsync(Guid id);
        Task<bool> DeleteCertificatesByVisitIdAsync(Guid visitId);
    }
}