using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IDewormingCheckoutRepository
    {
        Task<DewormingCheckout?> GetByIdAsync(Guid id);
        Task<IEnumerable<DewormingCheckout>> GetByVisitIdAsync(Guid visitId);
        Task<DewormingCheckout> CreateAsync(DewormingCheckout checkout);
        Task<DewormingCheckout> UpdateAsync(DewormingCheckout checkout);
        Task<bool> DeleteAsync(Guid id);
    }
} 