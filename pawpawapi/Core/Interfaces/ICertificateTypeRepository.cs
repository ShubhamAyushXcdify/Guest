using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface ICertificateTypeRepository
    {
        Task<CertificateType> CreateAsync(CertificateType certificateType);
        Task<CertificateType> GetByIdAsync(Guid id);
        Task<IEnumerable<CertificateType>> GetAllAsync();
        Task<CertificateType> UpdateAsync(CertificateType certificateType);
        Task<bool> DeleteAsync(Guid id);
    }
}

