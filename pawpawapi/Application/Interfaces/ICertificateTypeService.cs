using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface ICertificateTypeService
    {
        Task<CertificateTypeDto> CreateCertificateTypeAsync(CreateCertificateTypeDto dto);
        Task<CertificateTypeDto> GetCertificateTypeByIdAsync(Guid id);
        Task<IEnumerable<CertificateTypeDto>> GetAllCertificateTypesAsync();
        Task<CertificateTypeDto> UpdateCertificateTypeAsync(Guid id, UpdateCertificateTypeDto dto);
        Task<bool> DeleteCertificateTypeAsync(Guid id);
    }
}

