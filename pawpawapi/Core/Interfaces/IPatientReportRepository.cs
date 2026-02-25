using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IPatientReportRepository
    {
        Task<PatientReport> CreateAsync(PatientReport patientReport);
        Task<PatientReport?> GetByIdAsync(Guid id);
        Task<IEnumerable<PatientReport>> GetByPatientIdAsync(Guid patientId);
        Task<IEnumerable<PatientReport>> GetByDoctorIdAsync(Guid doctorId);
        Task<PatientReport> UpdateAsync(PatientReport patientReport);
        Task<bool> DeleteAsync(Guid id);
    }
}

