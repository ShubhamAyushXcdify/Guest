using System;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IVitalDetailRepository
    {
        Task<VitalDetail> CreateAsync(VitalDetail vitalDetail);
        Task<VitalDetail> GetByIdAsync(Guid id);
        Task<VitalDetail> GetByVisitIdAsync(Guid visitId);
        Task<VitalDetail> UpdateAsync(VitalDetail vitalDetail);
        Task<bool> DeleteAsync(Guid id);
    }
} 