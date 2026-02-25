using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface ISymptomRepository
    {
        Task<Symptom> CreateAsync(Symptom symptom);
        Task<IEnumerable<Symptom>> GetAllAsync();
        Task<IEnumerable<Symptom>> GetByBreedAsync(string? breed);
        Task<Symptom> GetByIdAsync(Guid id);
        Task<Symptom> UpdateAsync(Symptom symptom);
        Task<bool> DeleteAsync(Guid id);
    }
} 