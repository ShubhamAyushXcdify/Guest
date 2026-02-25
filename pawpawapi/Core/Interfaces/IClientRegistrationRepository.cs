using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IClientRegistrationRepository
    {
        Task<ClientRegistration> CreateAsync(ClientRegistration registration);
        Task<ClientRegistration?> GetByIdAsync(Guid id);
        Task<ClientRegistration?> GetByEmailAsync(string email);
        Task<(IEnumerable<ClientRegistration> Items, int TotalCount)> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            string? status = null);
        Task<ClientRegistration> UpdateAsync(ClientRegistration registration);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<ClientRegistration>> GetPendingRegistrationsAsync();
    }
} 