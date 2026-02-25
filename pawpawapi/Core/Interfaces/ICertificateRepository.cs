using Core.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface ICertificateRepository
    {
        Task<IEnumerable<Certificate>> GetAllAsync();
        Task<Certificate> GetByIdAsync(Guid id);
        Task<IEnumerable<Certificate>> GetByVisitIdAsync(Guid visitId);
        Task<Certificate> AddAsync(Certificate certificate);
        Task<IEnumerable<Certificate>> AddBatchAsync(IEnumerable<Certificate> certificates);
        Task<Certificate> UpdateAsync(Certificate certificate);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> DeleteByVisitIdAsync(Guid visitId);
    }
} 