using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IClientRepository
    {
        Task<Client> CreateAsync(Client client);
        Task<Client> GetByIdAsync(Guid id);
        Task<(IEnumerable<Client> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            string? type = null,
            string? query = null,
            Guid? companyId = null,
            string? firstName = null,
            string? lastName = null,
            string? email = null,
            string? phonePrimary = null,
            string? phoneSecondary = null);

        Task<Client> UpdateAsync(Client client);
        Task<Client> UpdatePasswordAsync(Client client);
        Task<bool> DeleteAsync(Guid id);
        Task<Client> GetByEmailAsync(string email);
        Task<Client?> GetByEmailAndCompanyAsync(string email, Guid companyId);
    }
}
