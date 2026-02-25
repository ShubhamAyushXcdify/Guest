using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ClientService : IClientService
    {
        private readonly IClientRepository _clientRepository;
        private readonly IClinicService _clinicService;
        private readonly IMapper _mapper;
        private readonly ILogger<ClientService> _logger;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ICompanyService _companyService;
        private readonly IClientDeletionOtpRepository _otpRepository;
        private readonly ISmsService _smsService;

        public ClientService(
            IClientRepository clientRepository,
            IClinicService clinicService,
            IMapper mapper,
            ILogger<ClientService> logger,
            IEmailService emailService,
            IConfiguration configuration,
            ICompanyService companyService,
            IClientDeletionOtpRepository otpRepository,
            ISmsService smsService)
        {
            _clientRepository = clientRepository ?? throw new ArgumentNullException(nameof(clientRepository));
            _clinicService = clinicService ?? throw new ArgumentNullException(nameof(clinicService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _companyService = companyService ?? throw new ArgumentNullException(nameof(companyService));
            _otpRepository = otpRepository ?? throw new ArgumentNullException(nameof(otpRepository));
            _smsService = smsService ?? throw new ArgumentNullException(nameof(smsService));
        }

        public async Task<PaginatedResponseDto<ClientResponseDto>> GetAllAsync(ClientFilterDto filter)
        {
            try
            {
                var (clients, totalCount) = await _clientRepository.GetAllAsync(
                    filter.PageNumber,
                    filter.PageSize,
                    filter.Type,
                    filter.Query,
                    filter.CompanyId,
                    filter.FirstName,
                    filter.LastName,
                    filter.Email,
                    filter.PhonePrimary,
                    filter.PhoneSecondary);

                var dtos = _mapper.Map<IEnumerable<ClientResponseDto>>(clients).ToList();

                var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);
                
                return new PaginatedResponseDto<ClientResponseDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    PageNumber = filter.PageNumber,
                    PageSize = filter.PageSize,
                    TotalPages = totalPages,
                    HasPreviousPage = filter.PageNumber > 1,
                    HasNextPage = filter.PageNumber < totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<ClientResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var client = await _clientRepository.GetByIdAsync(id);
                if (client == null)
                {
                    throw new KeyNotFoundException($"Client with id {id} not found.");
                }
                return _mapper.Map<ClientResponseDto>(client);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for client {ClientId}", id);
                throw;
            }
        }

        public async Task<ClientResponseDto> CreateAsync(CreateClientRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Client data cannot be null.");

                // Validate that the company exists
                var company = await _companyService.GetCompanyByIdAsync(dto.CompanyId);
                if (company == null)
                {
                    throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist");
                }

                if (!string.IsNullOrWhiteSpace(dto.Email))
                {
                    var existingInCompany = await _clientRepository.GetByEmailAndCompanyAsync(dto.Email.Trim(), dto.CompanyId);
                    if (existingInCompany != null)
                    {
                        throw new InvalidOperationException("A client with this email already exists in this company.");
                    }
                }

                var client = _mapper.Map<Client>(dto);
                var password = $"{client.FirstName}@321";
                client.EncryptedPassword = HashPassword(password);
                var created = await _clientRepository.CreateAsync(client);
                var loginUrl = _configuration["AppSettings:LoginUrl"] ?? "https://www.pawtrack.com";

                if (!string.IsNullOrEmpty(created.Email))
                {
                    var subject = "🎉 Welcome to " + company.Name + " – Your Veterinary Care Companion";

                    var body = $@"
<!DOCTYPE html PUBLIC ""-//W3C//DTD XHTML 1.0 Transitional//EN"" ""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"">
<html xmlns=""http://www.w3.org/1999/xhtml"">
<head>
    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
    <title>Welcome to {company.Name}</title>
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
                            <h1 style=""margin: 0; padding: 0; font-size: 28px; font-weight: bold; color: #ffffff;"">🎉 Welcome to {company.Name}</h1>
                            <p style=""margin: 10px 0 0 0; padding: 0; font-size: 16px; color: #ffffff;"">Your Veterinary Care Companion</p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style=""padding: 30px;"">
                            
                            <!-- Greeting -->
                            <p style=""margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Dear {client.FirstName} {client.LastName},
                            </p>

                            <!-- Welcome Message -->
                            <p style=""margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Welcome to <strong>{company.Name}</strong>! We're excited to have you and your pet(s) as part of our clinic family.
                            </p>

                            <!-- Login Details Section -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <h2 style=""margin: 0 0 15px 0; font-size: 20px; color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;"">
                                            🔐 Your Login Details
                                        </h2>
                                        <p style=""margin: 0 0 15px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                            Here are your login details for accessing the <strong>Paw Track Customer Dashboard</strong>:
                                        </p>
                                        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold; width: 40%;"">Username:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{created.Email}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Temporary Password:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{password}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Login URL:</td>
                                                <td style=""padding: 8px 0; color: #1976d2;""><a href=""{loginUrl}"" style=""color: #1976d2; text-decoration: none;"">{loginUrl}</a></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Important Notice -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #fff8e1; border: 1px solid #ffb300;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0; font-size: 14px; color: #333333; line-height: 1.5;"">
                                            <strong>⚠️ Important:</strong> Please log in and update your password at your earliest convenience. The dashboard allows you to manage appointments, view medical records, and stay up to date with your pet's healthcare.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Support Message -->
                            <p style=""margin: 20px 0 10px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                If you have any questions or need assistance, feel free to reach out to our support team.
                            </p>

                            <!-- Closing -->
                            <p style=""margin: 10px 0 0 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Warm regards,<br/>
                                <strong>The {company.Name} Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td bgcolor=""#f5f5f5"" style=""padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;"">
                            <p style=""margin: 0 0 5px 0; color: #999999; font-size: 12px; line-height: 1.5;"">
                                This is an automated message. Please do not reply to this email.
                            </p>
                            <p style=""margin: 5px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;"">
                                For questions or concerns, please contact us directly.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

                    await _emailService.SendEmailAsync(created.Email, subject, body);
                }

                return _mapper.Map<ClientResponseDto>(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw;
            }
        }

        public async Task<ClientResponseDto> UpdateAsync(UpdateClientRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Client data cannot be null.");

                // Validate that the company exists
                var company = await _companyService.GetCompanyByIdAsync(dto.CompanyId);
                if (company == null)
                {
                    throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist");
                }

                if (!string.IsNullOrWhiteSpace(dto.Email))
                {
                    var existingInCompany = await _clientRepository.GetByEmailAndCompanyAsync(dto.Email.Trim(), dto.CompanyId);
                    if (existingInCompany != null && existingInCompany.Id != dto.Id)
                    {
                        throw new InvalidOperationException("A client with this email already exists in this company.");
                    }
                }

                var client = _mapper.Map<Client>(dto);
                var updated = await _clientRepository.UpdateAsync(client);
                return _mapper.Map<ClientResponseDto>(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for client {ClientId}", dto?.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                return await _clientRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for client {ClientId}", id);
                throw;
            }
        }

        public async Task RequestDeleteOtpAsync(Guid clientId)
        {
            try
            {
                // Get client details
                var client = await _clientRepository.GetByIdAsync(clientId);
                if (client == null)
                {
                    throw new KeyNotFoundException($"Client with id {clientId} not found.");
                }

                // Generate 6-digit OTP
                var random = new Random();
                var otp = random.Next(100000, 999999).ToString();
                var expiresAt = DateTime.UtcNow.AddMinutes(10); // OTP valid for 10 minutes

                // Save OTP to database
                await _otpRepository.CreateAsync(clientId, otp, expiresAt);

                // Send OTP via email if email exists
                if (!string.IsNullOrWhiteSpace(client.Email))
                {
                    var subject = "🔒 Client Account Deletion OTP - Paw Track";
                    var body = $@"
<!DOCTYPE html PUBLIC ""-//W3C//DTD XHTML 1.0 Transitional//EN"" ""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"">
<html xmlns=""http://www.w3.org/1999/xhtml"">
<head>
    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
    <title>Client Account Deletion OTP</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;"">
    <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f5f5f5; padding: 20px 0;"">
        <tr>
            <td align=""center"">
                <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""600"" style=""background-color: #ffffff; max-width: 600px;"">
                    <tr>
                        <td bgcolor=""#d32f2f"" style=""padding: 40px 30px; text-align: center; color: #ffffff;"">
                            <h1 style=""margin: 0; padding: 0; font-size: 28px; font-weight: bold; color: #ffffff;"">🔒 Account Deletion Request</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 30px;"">
                            <p style=""margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Dear {client.FirstName} {client.LastName},
                            </p>
                            <p style=""margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                We received a request to delete your client account. To proceed with the deletion, please use the OTP below:
                            </p>
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9; border: 2px solid #d32f2f;"">
                                <tr>
                                    <td style=""padding: 30px; text-align: center;"">
                                        <p style=""margin: 0 0 10px 0; font-size: 14px; color: #666666;"">Your One-Time Password (OTP)</p>
                                        <p style=""margin: 0; font-size: 36px; font-weight: bold; color: #d32f2f; letter-spacing: 8px;"">{otp}</p>
                                        <p style=""margin: 10px 0 0 0; font-size: 12px; color: #999999;"">Valid for 10 minutes</p>
                                    </td>
                                </tr>
                            </table>
                            <p style=""margin: 20px 0 0 0; font-size: 14px; color: #d32f2f; line-height: 1.5;"">
                                <strong>⚠️ Security Notice:</strong> If you didn't request this account deletion, please ignore this email or contact support immediately. Your account will remain unchanged.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
                    await _emailService.SendEmailAsync(client.Email, subject, body);
                    _logger.LogInformation("Delete OTP email sent to client {ClientId} at {Email}", clientId, client.Email);
                }

                // Send OTP via SMS if phone number exists
                if (!string.IsNullOrWhiteSpace(client.PhonePrimary))
                {
                    var smsMessage = $"Your account deletion OTP is: {otp}. Valid for 10 minutes. If you didn't request this, please ignore.";
                    var smsSent = await _smsService.SendSmsAsync(client.PhonePrimary, smsMessage);
                    if (smsSent)
                    {
                        _logger.LogInformation("Delete OTP SMS sent to client {ClientId} at {Phone}", clientId, client.PhonePrimary);
                    }
                    else
                    {
                        _logger.LogWarning("Failed to send delete OTP SMS to client {ClientId} at {Phone}", clientId, client.PhonePrimary);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RequestDeleteOtpAsync for client {ClientId}", clientId);
                throw;
            }
        }

        public async Task<bool> VerifyAndDeleteClientAsync(Guid clientId, string otp)
        {
            try
            {
                // Verify OTP
                var otpRecord = await _otpRepository.GetValidOtpAsync(clientId, otp);
                if (otpRecord == null)
                {
                    throw new UnauthorizedAccessException("Invalid or expired OTP.");
                }

                // Mark OTP as used
                await _otpRepository.MarkAsUsedAsync(otpRecord.Id);

                // Delete the client
                var deleted = await _clientRepository.DeleteAsync(clientId);
                if (deleted)
                {
                    _logger.LogInformation("Client {ClientId} deleted successfully after OTP verification", clientId);
                }
                else
                {
                    _logger.LogWarning("Client {ClientId} deletion returned false after OTP verification", clientId);
                }

                return deleted;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in VerifyAndDeleteClientAsync for client {ClientId}", clientId);
                throw;
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }
    }
}
