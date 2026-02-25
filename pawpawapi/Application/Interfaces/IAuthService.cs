using Application.DTOs;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto dto);
       // Task<UserResponseDto> RegisterAsync(RegisterRequestDto dto);
        Task RequestPasswordResetAsync(string email);
        Task<bool> VerifyResetOtpAsync(string email, string otp);
        Task ResetPasswordAsync(string email, string otp, string newPassword);
    }
} 