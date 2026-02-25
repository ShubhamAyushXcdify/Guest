using System;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IPasswordResetOtpRepository
    {
        Task CreateAsync(string email, string otp, DateTime expiresAt);
        Task<PasswordResetOtp?> GetValidOtpAsync(string email, string otp);
        Task MarkAsUsedAsync(Guid id);
    }
}