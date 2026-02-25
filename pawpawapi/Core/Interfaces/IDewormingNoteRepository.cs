using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IDewormingNoteRepository
    {
        Task<DewormingNote?> GetByIdAsync(Guid id);
        Task<IEnumerable<DewormingNote>> GetByVisitIdAsync(Guid visitId);
        Task<DewormingNote> CreateAsync(DewormingNote note);
        Task<DewormingNote> UpdateAsync(DewormingNote note);
        Task<bool> DeleteAsync(Guid id);
    }
} 