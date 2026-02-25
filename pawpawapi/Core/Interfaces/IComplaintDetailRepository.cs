using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;


namespace Core.Interfaces
{
    public interface IComplaintDetailRepository
    {
        Task<ComplaintDetail> CreateAsync(ComplaintDetail complaintDetail);
        Task<ComplaintDetail> GetByIdAsync(Guid id);
        Task<ComplaintDetail> GetByVisitIdAsync(Guid visitId);
        Task<ComplaintDetail> UpdateAsync(ComplaintDetail complaintDetail);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> AddSymptomAsync(Guid complaintDetailId, Guid symptomId);
        Task<bool> RemoveSymptomAsync(Guid complaintDetailId, Guid symptomId);
    }
} 