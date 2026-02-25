using System;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IDewormingIntakeRepository
    {
        Task<DewormingIntake> CreateAsync(DewormingIntake intake);
        Task<DewormingIntake?> GetByIdAsync(Guid id);
        Task<DewormingIntake?> GetByVisitIdAsync(Guid visitId);
        Task<DewormingIntake> UpdateAsync(DewormingIntake intake);
        Task<bool> DeleteAsync(Guid id);
    }
} 