using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IVisitRepository
    {
        Task<Visit?> GetByIdAsync(Guid id);
        Task<Visit?> GetByAppointmentIdAsync(Guid appointmentId);
        Task<(IEnumerable<Visit> Items, int TotalCount)> GetAllAsync(int pageNumber, int pageSize, bool paginationRequired = true);
        Task<Visit> AddAsync(Visit visit);
        Task<Visit> UpdateAsync(Visit visit);
        Task<bool> DeleteAsync(Guid id);
        Task<Visit?> GetByPatientIdAsync(Guid patientId);
    }
} 