using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IPatientFileRepository
    {
        Task<PatientFile> CreateAsync(PatientFile patientFile);
        Task<PatientFile?> GetByIdAsync(Guid id);
        Task<IEnumerable<PatientFile>> GetByPatientIdAsync(Guid patientId);
        Task<IEnumerable<PatientFile>> GetByVisitIdAsync(Guid visitId);
        Task<PatientFile> UpdateAsync(PatientFile patientFile);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> DeleteByVisitIdAsync(Guid visitId);
        Task<PatientFileAttachment> AddAttachmentAsync(PatientFileAttachment attachment);
        Task<ICollection<PatientFileAttachment>> GetAttachmentsByPatientFileIdAsync(Guid patientFileId);
        Task<bool> RemoveAttachmentAsync(Guid attachmentId);
        Task<PatientFileAttachment?> GetAttachmentByIdAsync(Guid attachmentId);
    }
}

