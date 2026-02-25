using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ClientRegistrationService : IClientRegistrationService
    {
        private readonly IClientRegistrationRepository _registrationRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly ICompanyService _companyService;
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;
        private readonly ILogger<ClientRegistrationService> _logger;
        private readonly IConfiguration _configuration;

        public ClientRegistrationService(
            IClientRegistrationRepository registrationRepository,
            IClientRepository clientRepository,
            IPatientRepository patientRepository,
            ICompanyService companyService,
            IEmailService emailService,
            IMapper mapper,
            ILogger<ClientRegistrationService> logger,
            IConfiguration configuration)
        {
            _registrationRepository = registrationRepository ?? throw new ArgumentNullException(nameof(registrationRepository));
            _clientRepository = clientRepository ?? throw new ArgumentNullException(nameof(clientRepository));
            _patientRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
            _companyService = companyService ?? throw new ArgumentNullException(nameof(companyService));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<ClientRegistrationResponseDto> RegisterAsync(ClientRegistrationRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Registration data cannot be null.");

                // Validate that the company exists
                var company = await _companyService.GetCompanyByIdAsync(dto.CompanyId);
                if (company == null)
                {
                    throw new ArgumentException($"Company with ID {dto.CompanyId} does not exist");
                }

                // Check if email already exists in clients table
                var existingClient = await _clientRepository.GetByEmailAsync(dto.Email);
                if (existingClient != null)
                {
                    throw new InvalidOperationException("A client with this email already exists.");
                }

                // Check if email already exists in pending registrations
                var existingRegistration = await _registrationRepository.GetByEmailAsync(dto.Email);
                if (existingRegistration != null)
                {
                    throw new InvalidOperationException("A registration request with this email already exists.");
                }

                // Create the client directly
                var client = _mapper.Map<Client>(dto);
                client.EncryptedPassword = HashPassword(dto.Password);
                client.IsActive = true; // New clients are active by default

                var createdClient = await _clientRepository.CreateAsync(client);

                var createdPets = new List<Patient>();
                // Create pets associated with the new client
                if (dto.IncludePetsInRegistration && dto.Pets != null && dto.Pets.Any())
                {
                    foreach (var petDto in dto.Pets)
                    {
                        var createPatientDto = _mapper.Map<CreatePatientRequestDto>(petDto);
                        createPatientDto.ClientId = createdClient.Id; // Assign the newly created client's ID
                        createPatientDto.CompanyId = createdClient.CompanyId;
                        var newPet = await _patientRepository.AddAsync(_mapper.Map<Patient>(createPatientDto));
                        createdPets.Add(newPet);
                    }
                }

                // Send welcome email to client
                await SendWelcomeEmail(createdClient);

                var responseDto = _mapper.Map<ClientRegistrationResponseDto>(createdClient);
                responseDto.Pets = _mapper.Map<List<PatientResponseDto>>(createdPets);

                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RegisterAsync");
                throw;
            }
        }

        public async Task<ClientRegistrationResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var client = await _clientRepository.GetByIdAsync(id);
                if (client == null)
                {
                    throw new KeyNotFoundException($"Client with id {id} not found.");
                }
                var response = _mapper.Map<ClientRegistrationResponseDto>(client);

                var (pets, _) = await _patientRepository.GetAllAsync(
                    pageNumber: 1,
                    pageSize: int.MaxValue,
                    clientId: id,
                    paginationRequired: false,
                    companyId: client.CompanyId);

                response.Pets = _mapper.Map<List<PatientResponseDto>>(pets);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for client registration {RegistrationId}", id);
                throw;
            }
        }

        public async Task<PaginatedResponseDto<ClientRegistrationResponseDto>> GetAllAsync(
            int pageNumber,
            int pageSize,
            string? status = null)
        {
            try
            {
                var (registrations, totalCount) = await _registrationRepository.GetAllAsync(
                    pageNumber,
                    pageSize,
                    status);

                var dtos = _mapper.Map<IEnumerable<ClientRegistrationResponseDto>>(registrations).ToList();

                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                return new PaginatedResponseDto<ClientRegistrationResponseDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = totalPages,
                    HasPreviousPage = pageNumber > 1,
                    HasNextPage = pageNumber < totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<ClientRegistrationResponseDto> ApproveRegistrationAsync(ApproveClientRegistrationRequestDto dto, Guid approvedByUserId)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Approval data cannot be null.");

                var registration = await _registrationRepository.GetByIdAsync(dto.RegistrationId);
                if (registration == null)
                {
                    throw new KeyNotFoundException($"Registration with ID {dto.RegistrationId} not found.");
                }

                if (registration.Status != "pending")
                {
                    throw new InvalidOperationException($"Registration is already {registration.Status}.");
                }

                if (dto.IsApproved)
                {
                    // Create the client
                    var client = _mapper.Map<Client>(registration);
                    client.EncryptedPassword = HashPassword(registration.Password);
                    client.IsActive = true;

                    var createdClient = await _clientRepository.CreateAsync(client);

                    // Update registration status
                    registration.Status = "approved";
                    registration.ApprovedBy = approvedByUserId;
                    registration.ApprovedAt = DateTimeOffset.UtcNow;

                    var updatedRegistration = await _registrationRepository.UpdateAsync(registration);

                    // Send welcome email to client
                    await SendWelcomeEmail(createdClient);

                    return _mapper.Map<ClientRegistrationResponseDto>(updatedRegistration);
                }
                else
                {
                    // Reject the registration
                    registration.Status = "rejected";
                    registration.RejectionReason = dto.RejectionReason;
                    registration.ApprovedBy = approvedByUserId;
                    registration.ApprovedAt = DateTimeOffset.UtcNow;

                    var updatedRegistration = await _registrationRepository.UpdateAsync(registration);

                    // Send rejection email to client
                    await SendRejectionEmail(registration);

                    return _mapper.Map<ClientRegistrationResponseDto>(updatedRegistration);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ApproveRegistrationAsync for registration {RegistrationId}", dto?.RegistrationId);
                throw;
            }
        }

        public async Task<IEnumerable<ClientRegistrationResponseDto>> GetPendingRegistrationsAsync()
        {
            try
            {
                var registrations = await _registrationRepository.GetPendingRegistrationsAsync();
                return _mapper.Map<IEnumerable<ClientRegistrationResponseDto>>(registrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPendingRegistrationsAsync");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                return await _registrationRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for client registration {RegistrationId}", id);
                throw;
            }
        }

        private async Task SendRegistrationNotificationEmail(ClientRegistration registration)
        {
            try
            {
                // Get company information
                var company = await _companyService.GetCompanyByIdAsync(registration.CompanyId);
                var companyName = company?.Name ?? "Paw Track";

                var adminEmail = _configuration["AppSettings:AdminEmail"] ?? "admin@pawtrack.com";
                var subject = "🔔 New Client Registration Request";
                var body = $@"
<!DOCTYPE html PUBLIC ""-//W3C//DTD XHTML 1.0 Transitional//EN"" ""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"">
<html xmlns=""http://www.w3.org/1999/xhtml"">
<head>
    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
    <title>New Registration Request</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;"">
    <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f5f5f5; padding: 20px 0;"">
        <tr>
            <td align=""center"">
                <!-- Main Container -->
                <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""600"" style=""background-color: #ffffff; max-width: 600px;"">
                    
                    <!-- Header -->
                    <tr>
                        <td bgcolor=""#225F69"" style=""padding: 40px 30px; text-align: center; color: #ffffff;"">
                            <h1 style=""margin: 0; padding: 0; font-size: 28px; font-weight: bold; color: #ffffff;"">🔔 New Registration Request</h1>
                            <p style=""margin: 10px 0 0 0; padding: 0; font-size: 16px; color: #ffffff;"">Action Required</p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style=""padding: 30px;"">
                            
                            <!-- Greeting -->
                            <p style=""margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Dear Admin,
                            </p>

                            <!-- Alert Box -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #dbf3f0; border-left: 4px solid #225F69;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                            A new client has submitted a registration request for <strong>{companyName}</strong>.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Client Information Section -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <h2 style=""margin: 0 0 15px 0; font-size: 20px; color: #225F69; border-bottom: 2px solid #225F69; padding-bottom: 10px;"">
                                            👤 Client Information
                                        </h2>
                                        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold; width: 40%;"">Name:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{registration.FirstName} {registration.LastName}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Email:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{registration.Email}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Phone:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{registration.PhonePrimary}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Submitted:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{registration.CreatedAt:dddd, MMMM dd, yyyy 'at' hh:mm tt}</td>
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
                                            <strong>⚠️ Action Required:</strong> Please review and approve or reject this registration request in the admin dashboard.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Closing -->
                            <p style=""margin: 20px 0 0 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Best regards,<br/>
                                <strong>Paw Track System</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td bgcolor=""#f5f5f5"" style=""padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;"">
                            <p style=""margin: 0 0 5px 0; color: #999999; font-size: 12px; line-height: 1.5;"">
                                This is an automated notification. Please do not reply to this email.
                            </p>
                            <p style=""margin: 5px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;"">
                                Please log in to your admin dashboard to take action.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

                await _emailService.SendEmailAsync(adminEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending registration notification email");
            }
        }

        private async Task SendWelcomeEmail(Client client)
        {
            try
            {
                if (string.IsNullOrEmpty(client.Email))
                    return;

                // Get company information
                var company = await _companyService.GetCompanyByIdAsync(client.CompanyId);
                var companyName = company?.Name ?? "Paw Track";

                var loginUrl = _configuration["AppSettings:LoginUrl"] ?? "https://www.pawtrack.com";
                var subject = "✅ Registration Approved – Welcome to " + companyName;

                var body = $@"
<!DOCTYPE html PUBLIC ""-//W3C//DTD XHTML 1.0 Transitional//EN"" ""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"">
<html xmlns=""http://www.w3.org/1999/xhtml"">
<head>
    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
    <title>Registration Approved</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;"">
    <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f5f5f5; padding: 20px 0;"">
        <tr>
            <td align=""center"">
                <!-- Main Container -->
                <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""600"" style=""background-color: #ffffff; max-width: 600px;"">
                    
                    <!-- Header -->
                    <tr>
                        <td bgcolor=""#225F69"" style=""padding: 40px 30px; text-align: center; color: #ffffff;"">
                            <h1 style=""margin: 0; padding: 0; font-size: 28px; font-weight: bold; color: #ffffff;"">✅ Registration Approved!</h1>
                            <p style=""margin: 10px 0 0 0; padding: 0; font-size: 16px; color: #ffffff;"">Welcome to {companyName}</p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style=""padding: 30px;"">
                            
                            <!-- Greeting -->
                            <p style=""margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Dear {client.FirstName} {client.LastName},
                            </p>

                            <!-- Success Message -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #dbf3f0; border-left: 4px solid #225F69;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                            Great news! Your registration request has been <strong style=""color: #225F69;"">approved</strong>. Welcome to <strong>{companyName}</strong>!
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Login Information Section -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <h2 style=""margin: 0 0 15px 0; font-size: 20px; color: #225F69; border-bottom: 2px solid #225F69; padding-bottom: 10px;"">
                                            🔐 Login Information
                                        </h2>
                                        <p style=""margin: 0 0 15px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                            You can now log in to your <strong>Paw Track Customer Dashboard</strong> using the email and password you provided during registration.
                                        </p>
                                        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold; width: 40%;"">Login URL:</td>
                                                <td style=""padding: 8px 0; color: #225F69;""><a href=""{loginUrl}"" style=""color: #225F69; text-decoration: none;"">{loginUrl}</a></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Features Section -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <h2 style=""margin: 0 0 15px 0; font-size: 20px; color: #225F69; border-bottom: 2px solid #225F69; padding-bottom: 10px;"">
                                            🎯 What You Can Do
                                        </h2>
                                        <p style=""margin: 0; font-size: 16px; color: #333333; line-height: 1.8;"">
                                            • Manage and schedule appointments<br/>
                                            • View your pet's medical records<br/>
                                            • Stay up to date with vaccinations and treatments<br/>
                                            • Receive reminders for important healthcare milestones
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
                                <strong>The {companyName} Team</strong>
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

                await _emailService.SendEmailAsync(client.Email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending welcome email to client {ClientEmail}", client.Email);
            }
        }

        private async Task SendRejectionEmail(ClientRegistration registration)
        {
            try
            {
                if (string.IsNullOrEmpty(registration.Email))
                    return;
                // Validate that the company exists
                var company = await _companyService.GetCompanyByIdAsync(registration.CompanyId);
                if (company == null)
                {
                    throw new ArgumentException($"Company with ID {registration.CompanyId} does not exist");
                }
                var subject = "❌ Registration Request Update – " + company.Name;
                var body = $@"
<!DOCTYPE html PUBLIC ""-//W3C//DTD XHTML 1.0 Transitional//EN"" ""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"">
<html xmlns=""http://www.w3.org/1999/xhtml"">
<head>
    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
    <title>Registration Request Update</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;"">
    <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f5f5f5; padding: 20px 0;"">
        <tr>
            <td align=""center"">
                <!-- Main Container -->
                <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""600"" style=""background-color: #ffffff; max-width: 600px;"">
                    
                    <!-- Header -->
                    <tr>
                        <td bgcolor=""#225F69"" style=""padding: 40px 30px; text-align: center; color: #ffffff;"">
                            <h1 style=""margin: 0; padding: 0; font-size: 28px; font-weight: bold; color: #ffffff;"">{company.Name}</h1>
                            <p style=""margin: 10px 0 0 0; padding: 0; font-size: 16px; color: #ffffff;"">Registration Request Update</p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style=""padding: 30px;"">
                            
                            <!-- Greeting -->
                            <p style=""margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Dear {registration.FirstName} {registration.LastName},
                            </p>

                            <!-- Thank You Message -->
                            <p style=""margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Thank you for your interest in <strong>{company.Name}</strong>.
                            </p>

                            <!-- Rejection Message -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #ffebee; border-left: 4px solid #f44336;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                            We regret to inform you that your registration request has not been approved at this time.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            {(!string.IsNullOrEmpty(registration.RejectionReason) ? $@"
                            <!-- Reason for Rejection Section -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <h2 style=""margin: 0 0 15px 0; font-size: 20px; color: #225F69; border-bottom: 2px solid #225F69; padding-bottom: 10px;"">
                                            📋 Reason for Rejection
                                        </h2>
                                        <p style=""margin: 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                            {registration.RejectionReason}
                                        </p>
                                    </td>
                                </tr>
                            </table>" : "")}

                            <!-- Contact Information -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #fff8e1; border: 1px solid #ffb300;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0; font-size: 14px; color: #333333; line-height: 1.5;"">
                                            <strong>📞 Need More Information?</strong><br/>
                                            If you believe this is an error or would like to provide additional information, please contact our clinic directly.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Closing Message -->
                            <p style=""margin: 20px 0 10px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Thank you for your understanding.
                            </p>

                            <!-- Closing -->
                            <p style=""margin: 10px 0 0 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Best regards,<br/>
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

                await _emailService.SendEmailAsync(registration.Email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending rejection email to {Email}", registration.Email);
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }
    }
}
