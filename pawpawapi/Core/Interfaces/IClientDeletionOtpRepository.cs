using System;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IClientDeletionOtpRepository
    {
        Task CreateAsync(Guid clientId, string otp, DateTime expiresAt);
        Task<ClientDeletionOtp?> GetValidOtpAsync(Guid clientId, string otp);
        Task MarkAsUsedAsync(Guid id);
    }
}
