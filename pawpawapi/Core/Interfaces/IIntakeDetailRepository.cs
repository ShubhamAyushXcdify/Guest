using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IIntakeDetailRepository
    {
        Task<IntakeDetail> CreateAsync(IntakeDetail intakeDetail);
        Task<IntakeDetail> GetByIdAsync(Guid id);
        Task<IntakeDetail> GetByVisitIdAsync(Guid visitId);
        Task<IntakeDetail> UpdateAsync(IntakeDetail intakeDetail);
        Task<bool> DeleteAsync(Guid id);
        Task<IntakeFile> AddFileAsync(IntakeFile file);
        Task<ICollection<IntakeFile>> GetFilesByIntakeDetailIdAsync(Guid intakeDetailId);
        Task<bool> RemoveFileAsync(Guid fileId);
        Task<IntakeFile?> GetFileByIdAsync(Guid fileId);
    }
} 