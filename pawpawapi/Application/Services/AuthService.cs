using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IClientRepository _clientRepository;
        private readonly ICompanyRepository _companyRepository;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;
        private readonly IPasswordResetOtpRepository _otpRepository;
        private readonly IRoleRepository _roleRepository;

        public AuthService(IUserRepository userRepository, IClientRepository clientRepository, ICompanyRepository companyRepository, IMapper mapper, IConfiguration config, IEmailService emailService, IPasswordResetOtpRepository otpRepository, IRoleRepository roleRepository)
        {
            _userRepository = userRepository;
            _clientRepository = clientRepository;
            _companyRepository = companyRepository;
            _mapper = mapper;
            _config = config;
            _emailService = emailService;
            _otpRepository = otpRepository;
            _roleRepository = roleRepository;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                {
                    throw new UnauthorizedAccessException("Email and password are required.");
                }

                var user = await _userRepository.GetByEmailAsync(dto.Email);

                if (user != null && user.IsActive == true)
                {
                var computedHash = HashPassword(dto.Password);
                if (!user.PasswordHash.Equals(computedHash, StringComparison.Ordinal))
                {
                    throw new UnauthorizedAccessException("Invalid email or password.");
                }

                // Block login if the user's company status is not active
                if (user.CompanyId.HasValue)
                {
                    var company = await _companyRepository.GetByIdAsync(user.CompanyId.Value);
                    if (company != null && !string.Equals(company.Status, "active", StringComparison.OrdinalIgnoreCase))
                    {
                        throw new UnauthorizedAccessException("Your company account is inactive. Please contact support.");
                    }
                }

                await _userRepository.UpdateLastLoginAsync(user.Id, DateTimeOffset.UtcNow);

                var token = GenerateJwtToken(user);
                var expiresAt = DateTimeOffset.UtcNow.AddHours(8);

                // Get the user's role priority
                int rolePriority = 0;
                if (user.RoleId != Guid.Empty)
                {
                    var role = await _roleRepository.GetByIdAsync(user.RoleId);
                    if (role != null)
                        rolePriority = role.Priority;
                }

                return new LoginResponseDto
                {
                    Token = token,
                    ExpiresAt = expiresAt,
                    User = _mapper.Map<UserResponseDto>(user),
                    RolePriority = rolePriority
                };

                }
                else
                {
                    var client= await _clientRepository.GetByEmailAsync(dto.Email);
                    if (client != null)
                    {
                        var computedHash = HashPassword(dto.Password);
                        if (!client.EncryptedPassword.Equals(computedHash, StringComparison.Ordinal))
                        {
                            throw new UnauthorizedAccessException("Invalid email or password.");
                        }
                        // Block client login if their company status is not active
                        var company = await _companyRepository.GetByIdAsync(client.CompanyId);
                        if (company != null && !string.Equals(company.Status, "active", StringComparison.OrdinalIgnoreCase))
                        {
                            throw new UnauthorizedAccessException("Your company account is inactive. Please contact support.");
                        }
                        var token = GenerateJwtClientToken(client);
                        var expiresAt = DateTimeOffset.UtcNow.AddHours(8);

                        var userDto = _mapper.Map<UserResponseDto>(client);
                        userDto.RoleName = "Client";
                        return new LoginResponseDto
                        {
                            Token = token,
                            ExpiresAt = expiresAt,
                            User = userDto
                        };
                    }
                    else
                    {
                        throw new UnauthorizedAccessException("Invalid email or password.");
                    }

                }

            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new UnauthorizedAccessException("An error occurred during login.", ex);
            }
        }

        public async Task RequestPasswordResetAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            var client = user == null ? await _clientRepository.GetByEmailAsync(email) : null;
            if (user == null && client == null)
                return;

            var otp = new Random().Next(100000, 999999).ToString();
            var expiresAt = DateTime.UtcNow.AddMinutes(10);

            await _otpRepository.CreateAsync(email, otp, expiresAt);

            var userName = user != null ? $"{user.FirstName} {user.LastName}" : $"{client.FirstName} {client.LastName}";
            var subject = "🔒 Password Reset OTP - Paw Track";
            var body = $@"
<!DOCTYPE html PUBLIC ""-//W3C//DTD XHTML 1.0 Transitional//EN"" ""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"">
<html xmlns=""http://www.w3.org/1999/xhtml"">
<head>
    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
    <title>Password Reset OTP</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;"">
    <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f5f5f5; padding: 20px 0;"">
        <tr>
            <td align=""center"">
                <!-- Main Container -->
                <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""600"" style=""background-color: #ffffff; max-width: 600px;"">
                    
                    <!-- Header -->
                    <tr>
                        <td bgcolor=""#667eea"" style=""padding: 40px 30px; text-align: center; color: #ffffff;"">
                            <h1 style=""margin: 0; padding: 0; font-size: 28px; font-weight: bold; color: #ffffff;"">🔒 Password Reset Request</h1>
                            <p style=""margin: 10px 0 0 0; padding: 0; font-size: 16px; color: #ffffff;"">Secure Your Account</p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style=""padding: 30px;"">
                            
                            <!-- Greeting -->
                            <p style=""margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Dear {userName},
                            </p>

                            <!-- Alert Box -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #e3f2fd; border-left: 4px solid #1976d2;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                            We received a request to reset your password. Use the OTP below to complete your password reset.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- OTP Section -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <h2 style=""margin: 0 0 15px 0; font-size: 20px; color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;"">
                                            🔑 Your One-Time Password (OTP)
                                        </h2>
                                        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                            <tr>
                                                <td align=""center"" style=""padding: 20px 0;"">
                                                    <div style=""background-color: #667eea; padding: 20px 40px; border-radius: 8px; display: inline-block;"">
                                                        <span style=""font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px;"">{otp}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align=""center"" style=""padding: 10px 0;"">
                                                    <p style=""margin: 0; font-size: 14px; color: #666666;"">
                                                        This OTP will expire in <strong style=""color: #d32f2f;"">10 minutes</strong>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Notice -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #fff8e1; border: 1px solid #ffb300;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0; font-size: 14px; color: #333333; line-height: 1.5;"">
                                            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support immediately. Your password will remain unchanged.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Instructions Section -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <h2 style=""margin: 0 0 15px 0; font-size: 20px; color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;"">
                                            📋 Instructions
                                        </h2>
                                        <p style=""margin: 0; font-size: 16px; color: #333333; line-height: 1.8;"">
                                            1. Enter the OTP in the password reset form<br/>
                                            2. Create your new secure password<br/>
                                            3. Confirm your new password<br/>
                                            4. Log in with your new credentials
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Closing -->
                            <p style=""margin: 20px 0 0 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Best regards,<br/>
                                <strong>The Paw Track Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td bgcolor=""#f5f5f5"" style=""padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;"">
                            <p style=""margin: 0 0 5px 0; color: #999999; font-size: 12px; line-height: 1.5;"">
                                This is an automated security message. Please do not reply to this email.
                            </p>
                            <p style=""margin: 5px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;"">
                                For questions or concerns, please contact support.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
            await _emailService.SendEmailAsync(email, subject, body);
        }

        public async Task<bool> VerifyResetOtpAsync(string email, string otp)
        {
            var record = await _otpRepository.GetValidOtpAsync(email, otp);
            return record != null;
        }

        public async Task ResetPasswordAsync(string email, string otp, string newPassword)
        {
            var record = await _otpRepository.GetValidOtpAsync(email, otp);
            if (record == null)
                throw new UnauthorizedAccessException("Invalid or expired OTP.");

            var user = await _userRepository.GetByEmailAsync(email);
            if (user != null)
            {
                user.PasswordHash = HashPassword(newPassword);
                await _userRepository.UpdateAsync(user);
            }
            else
            {
                var client = await _clientRepository.GetByEmailAsync(email);
                if (client == null)
                    throw new UnauthorizedAccessException("Account not found.");
                client.EncryptedPassword = HashPassword(newPassword);
                await _clientRepository.UpdatePasswordAsync(client);
            }

            await _otpRepository.MarkAsUsedAsync(record.Id);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"] ?? "YourSuperSecretKeyHere";
            var jwtIssuer = _config["Jwt:Issuer"] ?? "PawPawApi";
            var expires = DateTime.UtcNow.AddHours(8);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                //new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: null,
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateJwtClientToken(Client client)
        {
            var jwtKey = _config["Jwt:Key"] ?? "YourSuperSecretKeyHere";
            var jwtIssuer = _config["Jwt:Issuer"] ?? "PawPawApi";
            var expires = DateTime.UtcNow.AddHours(8);

            var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, client.Id?.ToString() ?? Guid.Empty.ToString()),
        new Claim(JwtRegisteredClaimNames.Email, client.Email ?? string.Empty),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: null,
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
} 