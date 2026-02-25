using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Application.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IClinicService _clinicService;
        private readonly IPatientService _patientService;
        private readonly IClientService _clientService;
        private readonly IUserService _userService;
        private readonly IRoomService _roomService;
        private readonly IVisitService _visitService;
        private readonly IAppointmentTypeService _appointmentTypeService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IPrescriptionDetailService _prescriptionDetailService;
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IPurchaseOrderReceivingHistoryRepository _purchaseOrderReceivingHistoryRepository;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;
        private readonly ILogger<AppointmentService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserRepository _userRepository;

        public AppointmentService(
            IAppointmentRepository appointmentRepository,
            IClinicService clinicService,
            IPatientService patientService,
            IClientService clientService,
            IUserService userService,
            IRoomService roomService,
            IVisitService visitService,
            IAppointmentTypeService appointmentTypeService,
            IEmailService emailService,
            IConfiguration configuration,
            IPrescriptionDetailService prescriptionDetailService,
            IInventoryRepository inventoryRepository,
            IPurchaseOrderReceivingHistoryRepository purchaseOrderReceivingHistoryRepository,
            INotificationService notificationService,
            IMapper mapper,
            ILogger<AppointmentService> logger,
            IHttpContextAccessor httpContextAccessor,
            IUserRepository userRepository)
        {
            _appointmentRepository = appointmentRepository ?? throw new ArgumentNullException(nameof(appointmentRepository));
            _clinicService = clinicService ?? throw new ArgumentNullException(nameof(clinicService));
            _patientService = patientService ?? throw new ArgumentNullException(nameof(patientService));
            _clientService = clientService ?? throw new ArgumentNullException(nameof(clientService));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _roomService = roomService ?? throw new ArgumentNullException(nameof(roomService));
            _visitService = visitService ?? throw new ArgumentNullException(nameof(visitService));
            _appointmentTypeService = appointmentTypeService ?? throw new ArgumentNullException(nameof(appointmentTypeService));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _prescriptionDetailService = prescriptionDetailService ?? throw new ArgumentNullException(nameof(prescriptionDetailService));
            _inventoryRepository = inventoryRepository ?? throw new ArgumentNullException(nameof(inventoryRepository));
            _purchaseOrderReceivingHistoryRepository = purchaseOrderReceivingHistoryRepository ?? throw new ArgumentNullException(nameof(purchaseOrderReceivingHistoryRepository));
            _notificationService = notificationService ?? throw new ArgumentNullException(nameof(notificationService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        }

        public async Task<AppointmentResponseDto> CreateAsync(CreateAppointmentRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Appointment data cannot be null.");

                // Set default status if not provided
                if (string.IsNullOrWhiteSpace(dto.Status))
                {
                    dto.Status = "scheduled";
                }

                // Validate appointment conflict for veterinarian
                await ValidateVeterinarianAvailabilityAsync(dto.VeterinarianId, dto.AppointmentDate, dto.AppointmentTimeFrom, dto.AppointmentTimeTo);

                var appointment = _mapper.Map<Appointment>(dto);

                // Fetch company_id from clinic_id if clinic_id is provided
                if (dto.ClinicId.HasValue)
                {
                    var clinic = await _clinicService.GetByIdAsync(dto.ClinicId.Value);
                    if (clinic != null)
                    {
                        appointment.CompanyId = clinic.CompanyId;
                    }
                }

                var createdAppointment = await _appointmentRepository.CreateAsync(appointment);
                var responseDto = _mapper.Map<AppointmentResponseDto>(createdAppointment);
                await PopulateRelatedDataAsync(responseDto);

                // Send real-time notification to clinic admin and veterinarian
                if (createdAppointment.ClinicId.HasValue)
                {
                    try
                    {
                        var notificationData = new Application.DTOs.AppointmentNotificationDataDto
                        {
                            AppointmentId = responseDto.Id,
                            ClinicId = createdAppointment.ClinicId.Value,
                            ClinicName = responseDto.Clinic?.Name ?? "Unknown Clinic",
                            ClientId = createdAppointment.ClientId ?? Guid.Empty,
                            ClientName = responseDto.Client != null 
                                ? $"{responseDto.Client.FirstName} {responseDto.Client.LastName}".Trim() 
                                : "Unknown Client",
                            PatientId = createdAppointment.PatientId,
                            PatientName = responseDto.Patient?.Name,
                            VeterinarianId = createdAppointment.VeterinarianId,
                            VeterinarianName = responseDto.Veterinarian != null 
                                ? $"{responseDto.Veterinarian.FirstName} {responseDto.Veterinarian.LastName}".Trim() 
                                : null,
                            AppointmentDate = createdAppointment.AppointmentDate,
                            AppointmentTimeFrom = createdAppointment.AppointmentTimeFrom,
                            AppointmentTimeTo = createdAppointment.AppointmentTimeTo,
                            AppointmentTypeId = createdAppointment.AppointmentTypeId,
                            AppointmentTypeName = responseDto.AppointmentType?.Name,
                            Status = createdAppointment.Status
                        };

                        // Resolve client user ID when client has a user account (same email) — for "Appointment registered successfully" notification
                        Guid? clientUserId = null;
                        if (createdAppointment.ClientId.HasValue)
                        {
                            var client = await _clientService.GetByIdAsync(createdAppointment.ClientId.Value);
                            if (client != null && !string.IsNullOrEmpty(client.Email))
                            {
                                var clientUser = await _userRepository.GetByEmailAsync(client.Email);
                                if (clientUser != null)
                                    clientUserId = clientUser.Id;
                            }
                        }

                        await _notificationService.SendAppointmentNotificationAsync(
                            createdAppointment.ClinicId.Value,
                            createdAppointment.VeterinarianId,
                            notificationData,
                            clientUserId);
                    }
                    catch (Exception ex)
                    {
                        // Log but don't fail the appointment creation if notification fails
                        _logger.LogError(ex, "Failed to send notification for appointment {AppointmentId}", createdAppointment.Id);
                    }
                }

                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw;
            }
        }

        public async Task<AppointmentResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var appointment = await _appointmentRepository.GetByIdAsync(id);
                if (appointment == null)
                {
                    throw new KeyNotFoundException($"Appointment with id {id} not found.");
                }

                var dto = _mapper.Map<AppointmentResponseDto>(appointment);
                await PopulateRelatedDataAsync(dto);
                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for appointment {AppointmentId}", id);
                throw;
            }
        }

        public async Task<PaginatedResponseDto<AppointmentResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid? clinicId = null,
            Guid? patientId = null,
            Guid? clientId = null,
            Guid? veterinarianId = null,
            Guid? roomId = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            bool? isRegistered = null,
            Guid? companyId = null)
        {
            try
            {
                var (appointments, totalCount) = await _appointmentRepository.GetAllAsync(
                    pageNumber,
                    pageSize,
                    clinicId,
                    patientId,
                    clientId,
                    veterinarianId,
                    roomId,
                    dateFrom,
                    dateTo,
                    isRegistered,
                    companyId);

                var dtos = _mapper.Map<IEnumerable<AppointmentResponseDto>>(appointments).ToList();

                // Populate related data for all appointments
                await PopulateRelatedDataBatchAsync(dtos);

                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
                return new PaginatedResponseDto<AppointmentResponseDto>
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

        public async Task<AppointmentResponseDto> UpdateAsync(UpdateAppointmentRequestDto dto, bool sendEmail = false)
        {
            try
            {
                var existingAppointment = await _appointmentRepository.GetByIdAsync(dto.Id);
                if (existingAppointment == null)
                {
                    throw new KeyNotFoundException($"Appointment with id {dto.Id} not found.");
                }

                // Check if status is being changed to "completed"
                bool isStatusChangedToCompleted = existingAppointment.Status != "completed" && dto.Status == "completed";
                
                // Check if status is being changed to "cancelled" or "canceled"
                bool isStatusChangedToCancelled = 
                    existingAppointment.Status != null &&
                    !existingAppointment.Status.Equals("cancelled", StringComparison.OrdinalIgnoreCase) &&
                    !existingAppointment.Status.Equals("canceled", StringComparison.OrdinalIgnoreCase) &&
                    dto.Status != null &&
                    (dto.Status.Equals("cancelled", StringComparison.OrdinalIgnoreCase) ||
                     dto.Status.Equals("canceled", StringComparison.OrdinalIgnoreCase));

                // Map the updated data to the existing appointment
                existingAppointment.ClinicId = dto.ClinicId;
                existingAppointment.PatientId = dto.PatientId;
                existingAppointment.ClientId = dto.ClientId;
                existingAppointment.VeterinarianId = dto.VeterinarianId;
                existingAppointment.RoomId = dto.RoomId;
                existingAppointment.AppointmentDate = dto.AppointmentDate;
                existingAppointment.AppointmentTimeFrom = dto.AppointmentTimeFrom;
                existingAppointment.AppointmentTimeTo = dto.AppointmentTimeTo;
                existingAppointment.AppointmentTypeId = dto.AppointmentTypeId;
                existingAppointment.Reason = dto.Reason;
                existingAppointment.Status = dto.Status;
                existingAppointment.Notes = dto.Notes;
                existingAppointment.IsRegistered = dto.IsRegistered;

                // Fetch company_id from clinic_id if clinic_id is provided
                if (dto.ClinicId.HasValue)
                {
                    var clinic = await _clinicService.GetByIdAsync(dto.ClinicId.Value);
                    if (clinic != null)
                    {
                        existingAppointment.CompanyId = clinic.CompanyId;
                    }
                }

                var updatedAppointment = await _appointmentRepository.UpdateAsync(existingAppointment);

                // Create visit when appointment status changes to "in_progress"
                if (dto.Status == "in_progress")
                {
                    var visitDto = new CreateVisitRequestDto
                    {
                        AppointmentId = dto.Id,
                        PatientId = dto.PatientId,
                        IsIntakeCompleted = false,
                        IsComplaintsCompleted = false,
                        IsVitalsCompleted = false,
                        IsPlanCompleted = false
                    };
                    await _visitService.CreateAsync(visitDto);
                }

                // Handle inventory deduction when appointment is completed
                if (isStatusChangedToCompleted)
                {
                    await DeductPrescriptionInventoryAsync(dto.Id);
                }

                // Handle cancellation notifications
                if (isStatusChangedToCancelled && updatedAppointment.ClinicId.HasValue)
                {
                    try
                    {
                        // Get current user to determine who is cancelling
                        var currentUserId = GetCurrentUserId();
                        bool cancelledByVeterinarian = false;

                        if (currentUserId.HasValue)
                        {
                            var currentUser = await _userRepository.GetByIdAsync(currentUserId.Value);
                            if (currentUser != null)
                            {
                                // Check if current user is a veterinarian
                                cancelledByVeterinarian = currentUser.RoleName != null &&
                                    (currentUser.RoleName.Equals("Veterinarian", StringComparison.OrdinalIgnoreCase) ||
                                     currentUser.RoleName.Equals("veterinarian", StringComparison.OrdinalIgnoreCase) ||
                                     (currentUser.RoleValue != null && currentUser.RoleValue.Equals("veterinarian", StringComparison.OrdinalIgnoreCase)));
                            }
                        }

                        var responseDtoForNotification = _mapper.Map<AppointmentResponseDto>(updatedAppointment);
                        await PopulateRelatedDataAsync(responseDtoForNotification);

                        var cancellationData = new AppointmentNotificationDataDto
                        {
                            AppointmentId = updatedAppointment.Id,
                            ClinicId = updatedAppointment.ClinicId.Value,
                            ClinicName = responseDtoForNotification.Clinic?.Name ?? "Unknown Clinic",
                            ClientId = updatedAppointment.ClientId ?? Guid.Empty,
                            ClientName = responseDtoForNotification.Client != null
                                ? $"{responseDtoForNotification.Client.FirstName} {responseDtoForNotification.Client.LastName}".Trim()
                                : "Unknown Client",
                            PatientId = updatedAppointment.PatientId,
                            PatientName = responseDtoForNotification.Patient?.Name,
                            VeterinarianId = updatedAppointment.VeterinarianId,
                            VeterinarianName = responseDtoForNotification.Veterinarian != null
                                ? $"{responseDtoForNotification.Veterinarian.FirstName} {responseDtoForNotification.Veterinarian.LastName}".Trim()
                                : null,
                            AppointmentDate = updatedAppointment.AppointmentDate,
                            AppointmentTimeFrom = updatedAppointment.AppointmentTimeFrom,
                            AppointmentTimeTo = updatedAppointment.AppointmentTimeTo,
                            AppointmentTypeId = updatedAppointment.AppointmentTypeId,
                            AppointmentTypeName = responseDtoForNotification.AppointmentType?.Name,
                            Status = updatedAppointment.Status
                        };

                        // Get client user ID if client has a user account
                        Guid? clientUserId = null;
                        if (updatedAppointment.ClientId.HasValue)
                        {
                            var client = await _clientService.GetByIdAsync(updatedAppointment.ClientId.Value);
                            if (client != null && !string.IsNullOrEmpty(client.Email))
                            {
                                // Try to find user account by email
                                var clientUser = await _userRepository.GetByEmailAsync(client.Email);
                                if (clientUser != null)
                                {
                                    clientUserId = clientUser.Id;
                                }
                            }
                        }

                        await _notificationService.SendAppointmentCancellationNotificationAsync(
                            updatedAppointment.ClinicId.Value,
                            updatedAppointment.VeterinarianId,
                            clientUserId,
                            cancellationData,
                            cancelledByVeterinarian);
                    }
                    catch (Exception ex)
                    {
                        // Log but don't fail the appointment update if notification fails
                        _logger.LogError(ex, "Failed to send cancellation notification for appointment {AppointmentId}", dto.Id);
                    }
                }

                // Send email notification if requested, but not for cancelled appointments
                if ((sendEmail || dto.SendEmail) && 
                    updatedAppointment.Status != null &&
                    !updatedAppointment.Status.Equals("cancelled", StringComparison.OrdinalIgnoreCase) &&
                    !updatedAppointment.Status.Equals("canceled", StringComparison.OrdinalIgnoreCase))
                {
                    await SendAppointmentConfirmationEmailAsync(updatedAppointment);
                }

                var responseDto = _mapper.Map<AppointmentResponseDto>(updatedAppointment);
                await PopulateRelatedDataAsync(responseDto);
                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for appointment {AppointmentId}", dto.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                return await _appointmentRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for appointment {AppointmentId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<AppointmentResponseDto>> GetByPatientIdAsync(Guid patientId)
        {
            try
            {
                var appointments = await _appointmentRepository.GetByPatientIdAsync(patientId);
                var dtos = _mapper.Map<IEnumerable<AppointmentResponseDto>>(appointments).ToList();
                await PopulateRelatedDataBatchAsync(dtos);
                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByPatientIdAsync for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<AppointmentResponseDto> UpdateRegistrationStatusAsync(Guid id, bool isRegistered)
        {
            try
            {
                var existingAppointment = await _appointmentRepository.GetByIdAsync(id);
                if (existingAppointment == null)
                {
                    throw new KeyNotFoundException($"Appointment with id {id} not found.");
                }

                existingAppointment.IsRegistered = isRegistered;
                var updatedAppointment = await _appointmentRepository.UpdateAsync(existingAppointment);
                var responseDto = _mapper.Map<AppointmentResponseDto>(updatedAppointment);
                await PopulateRelatedDataAsync(responseDto);
                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateRegistrationStatusAsync for appointment {AppointmentId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<AppointmentResponseDto>> GetByClientIdWithFiltersAsync(Guid clientId, string status, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var appointments = await _appointmentRepository.GetByClientIdWithFiltersAsync(clientId, status, fromDate, toDate);
                var dtos = _mapper.Map<IEnumerable<AppointmentResponseDto>>(appointments).ToList();
                await PopulateRelatedDataBatchAsync(dtos);
                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByClientIdWithFiltersAsync for client {ClientId}", clientId);
                throw;
            }
        }

        public async Task<List<ProviderDashboardSummaryDto>> GetProviderDashboardAsync(DateTime? fromDate, DateTime? toDate, Guid? clinicId = null, Guid? companyId = null)
        {
            try
            {
                var userService = _userService;
                var allProvidersResult = await userService.GetAllAsync(1, 1000, null, clinicId.HasValue ? new[] { clinicId.Value } : null, false, companyId);
                var allProviders = allProvidersResult.Items.ToList();

                var counts = await _appointmentRepository.GetProviderAppointmentCountsAsync(fromDate, toDate, clinicId);
                var countsDict = counts.ToDictionary(x => x.ProviderId, x => x);

                var providerSummaries = new List<ProviderDashboardSummaryDto>();

                foreach (var provider in allProviders)
                {
                    if (provider.RoleName == null) continue;
                    var name = $"{provider.FirstName} {provider.LastName}";
                    var specialty = provider.RoleName;
                    var avatarUrl = null as string;
                    var count = countsDict.ContainsKey(provider.Id) ? countsDict[provider.Id] : (provider.Id, 0, 0, 0);

                    // Fetch appointments for this provider for the date range
                    var paged = await GetAllAsync(1, 100, clinicId, null, null, provider.Id, null, fromDate, toDate);
                    var appointments = paged.Items.ToList();

                    providerSummaries.Add(new ProviderDashboardSummaryDto
                    {
                        Id = provider.Id,
                        Name = name,
                        Role = provider.RoleName,
                        Specialty = specialty,
                        AvatarUrl = avatarUrl,
                        Total = count.Item2,
                        Done = count.Item3,
                        Pending = count.Item4,
                        Appointments = appointments
                    });
                }

                return providerSummaries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProviderDashboardAsync");
                throw;
            }
        }

        private async Task ValidateVeterinarianAvailabilityAsync(Guid? veterinarianId, DateTime appointmentDate, TimeSpan? timeFrom, TimeSpan? timeTo)
        {
            if (!veterinarianId.HasValue || appointmentDate == default || !timeFrom.HasValue || !timeTo.HasValue)
                return;

            try
            {
                var appointments = await _appointmentRepository.GetByVeterinarianAndDateAsync(veterinarianId.Value, appointmentDate);
                var conflict = appointments.FirstOrDefault(a =>
                    a.Status == "scheduled" &&
                    a.AppointmentTimeFrom.HasValue && a.AppointmentTimeTo.HasValue &&
                    a.AppointmentTimeFrom.Value < timeTo.Value &&
                    a.AppointmentTimeTo.Value > timeFrom.Value
                );

                if (conflict != null)
                {
                    string patientMsg = conflict.PatientId.HasValue ? $" (PatientId: {conflict.PatientId})" : "";
                    throw new InvalidOperationException($"This veterinarian is already booked for another patient{patientMsg} on {appointmentDate:yyyy-MM-dd} from {conflict.AppointmentTimeFrom:hh\\:mm} to {conflict.AppointmentTimeTo:hh\\:mm}.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating veterinarian availability");
                throw;
            }
        }
        private async Task PopulateRelatedDataAsync(AppointmentResponseDto dto)
        {
            try
            {
                if (dto.ClinicId.HasValue)
                    dto.Clinic = await _clinicService.GetByIdAsync(dto.ClinicId.Value);

                if (dto.PatientId.HasValue)
                    dto.Patient = await _patientService.GetByIdAsync(dto.PatientId.Value);

                if (dto.ClientId.HasValue)
                    dto.Client = await _clientService.GetByIdAsync(dto.ClientId.Value);

                if (dto.VeterinarianId.HasValue)
                    dto.Veterinarian = await _userService.GetByIdAsync(dto.VeterinarianId.Value);

                if (dto.RoomId.HasValue)
                    dto.Room = await _roomService.GetByIdAsync(dto.RoomId.Value);

                if (dto.AppointmentTypeId.HasValue)
                {
                    var appointmentType = await _appointmentTypeService.GetAppointmentTypeByIdAsync(dto.AppointmentTypeId.Value);
                    dto.AppointmentType = _mapper.Map<AppointmentTypeResponseDto>(appointmentType);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error populating related data for appointment {AppointmentId}", dto.Id);
                // Don't throw - just log the error and continue
            }
        }

        private async Task PopulateRelatedDataBatchAsync(List<AppointmentResponseDto> dtos)
        {
            try
            {
                // Get all unique IDs for batch processing
                var clinicIds = dtos.Where(d => d.ClinicId.HasValue).Select(d => d.ClinicId.Value).Distinct().ToList();
                var patientIds = dtos.Where(d => d.PatientId.HasValue).Select(d => d.PatientId.Value).Distinct().ToList();
                var clientIds = dtos.Where(d => d.ClientId.HasValue).Select(d => d.ClientId.Value).Distinct().ToList();
                var veterinarianIds = dtos.Where(d => d.VeterinarianId.HasValue).Select(d => d.VeterinarianId.Value).Distinct().ToList();
                var roomIds = dtos.Where(d => d.RoomId.HasValue).Select(d => d.RoomId.Value).Distinct().ToList();
                var appointmentTypeIds = dtos.Where(d => d.AppointmentTypeId.HasValue).Select(d => d.AppointmentTypeId.Value).Distinct().ToList();

                // For now, populate individually - can be optimized later with batch methods
                foreach (var dto in dtos)
                {
                    await PopulateRelatedDataAsync(dto);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in batch populating related data");
                // Don't throw - just log the error and continue
            }
        }

        private async Task DeductPrescriptionInventoryAsync(Guid appointmentId)
        {
            try
            {
                // Get the appointment to get the clinic ID
                var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
                if (appointment == null)
                {
                    _logger.LogWarning("Appointment not found for appointment {AppointmentId}, skipping inventory deduction", appointmentId);
                    return;
                }

                // Get the visit for this appointment
                var visit = await _visitService.GetByAppointmentIdAsync(appointmentId);

                if (visit == null)
                {
                    _logger.LogInformation("No visit found for appointment {AppointmentId}, skipping inventory deduction", appointmentId);
                    return;
                }

                // Get prescription details for this visit
                try
                {
                    var prescriptionDetail = await _prescriptionDetailService.GetByVisitIdAsync(visit.Id);

                    if (prescriptionDetail?.ProductMappings != null && prescriptionDetail.ProductMappings.Any())
                    {
                        foreach (var mapping in prescriptionDetail.ProductMappings)
                        {
                            // Only process checked items with valid quantity and product ID
                            if (mapping.IsChecked && mapping.Quantity.HasValue && mapping.Quantity.Value > 0 && mapping.ProductId.HasValue)
                            {
                                // Update purchase order receiving history - this is the primary inventory tracking
                                if (mapping.PurchaseOrderReceivingHistoryId.HasValue)
                                {
                                    var receivingHistory = await _purchaseOrderReceivingHistoryRepository.GetByIdAsync(mapping.PurchaseOrderReceivingHistoryId.Value);
                                    if (receivingHistory != null)
                                    {
                                        // Check if there's sufficient quantity
                                        if (receivingHistory.QuantityOnHand >= mapping.Quantity.Value)
                                        {
                                            // Deduct the prescribed quantity from the receiving history
                                            receivingHistory.QuantityOnHand -= mapping.Quantity.Value;
                                            receivingHistory.UpdatedAt = DateTimeOffset.UtcNow;
                                            await _purchaseOrderReceivingHistoryRepository.UpdateAsync(receivingHistory);

                                            _logger.LogInformation(
                                                "Deducted {Quantity} units from purchase order receiving history {ReceivingHistoryId} for appointment {AppointmentId}",
                                                mapping.Quantity.Value, mapping.PurchaseOrderReceivingHistoryId.Value, appointmentId);

                                            // Also update corresponding inventory record if it exists
                                            var inventoryList = await _inventoryRepository.GetByProductAndBatchRangeAsync(
                                                mapping.ProductId.Value,
                                                appointment.ClinicId ?? Guid.Empty,
                                                null, // lotNumber
                                                receivingHistory.BatchNumber // specific batch number
                                            );

                                            var inventory = inventoryList.FirstOrDefault();
                                            if (inventory != null)
                                            {
                                                // Check if there's sufficient quantity in inventory
                                                if (inventory.QuantityOnHand >= mapping.Quantity.Value)
                                                {
                                                    // Deduct the prescribed quantity from inventory
                                                    inventory.QuantityOnHand -= mapping.Quantity.Value;
                                                    inventory.UpdatedAt = DateTimeOffset.UtcNow;
                                                    await _inventoryRepository.UpdateAsync(inventory);

                                                    _logger.LogInformation(
                                                        "Deducted {Quantity} units of product {ProductId} from inventory batch {BatchNumber} for appointment {AppointmentId}",
                                                        mapping.Quantity.Value, mapping.ProductId.Value, inventory.BatchNumber, appointmentId);
                                                }
                                                else
                                                {
                                                    _logger.LogWarning(
                                                        "Insufficient quantity in inventory batch {BatchNumber}. Available: {Available}, Required: {Required}",
                                                        inventory.BatchNumber, inventory.QuantityOnHand, mapping.Quantity.Value);
                                                }
                                            }
                                            else
                                            {
                                                _logger.LogWarning(
                                                    "No inventory record found for product {ProductId} batch {BatchNumber} in clinic {ClinicId}",
                                                    mapping.ProductId.Value, receivingHistory.BatchNumber, appointment.ClinicId);
                                            }
                                        }
                                        else
                                        {
                                            _logger.LogWarning(
                                                "Insufficient quantity in purchase order receiving history {ReceivingHistoryId}. Available: {Available}, Required: {Required}",
                                                mapping.PurchaseOrderReceivingHistoryId.Value, receivingHistory.QuantityOnHand, mapping.Quantity.Value);
                                        }
                                    }
                                    else
                                    {
                                        _logger.LogWarning(
                                            "Purchase order receiving history {ReceivingHistoryId} not found for appointment {AppointmentId}",
                                            mapping.PurchaseOrderReceivingHistoryId.Value, appointmentId);
                                    }
                                }
                                else
                                {
                                    _logger.LogWarning(
                                        "No purchase order receiving history ID specified for product {ProductId} in appointment {AppointmentId}",
                                        mapping.ProductId.Value, appointmentId);
                                }
                            }
                        }
                    }
                    else
                    {
                        _logger.LogInformation("No prescription details found for visit {VisitId}, skipping inventory deduction", visit.Id);
                    }
                }
                catch (KeyNotFoundException)
                {
                    // No prescription details found for this visit
                    _logger.LogInformation("No prescription details found for visit {VisitId}, skipping inventory deduction", visit.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deducting prescription inventory for appointment {AppointmentId}", appointmentId);
                // Don't throw the exception to avoid breaking the appointment update
                // Just log the error and continue
            }
        }

        private async Task SendAppointmentConfirmationEmailAsync(Appointment appointment)
        {
            try
            {
                // Get client information
                var client = await _clientService.GetByIdAsync(appointment.ClientId.Value);
                if (client == null || string.IsNullOrEmpty(client.Email))
                {
                    _logger.LogWarning("Client not found or email is empty for appointment {AppointmentId}", appointment.Id);
                    return;
                }

                // Get patient information
                var patient = await _patientService.GetByIdAsync(appointment.PatientId.Value);
                if (patient == null)
                {
                    _logger.LogWarning("Patient not found for appointment {AppointmentId}", appointment.Id);
                    return;
                }

                // Get clinic information
                var clinic = await _clinicService.GetByIdAsync(appointment.ClinicId.Value);
                if (clinic == null)
                {
                    _logger.LogWarning("Clinic not found for appointment {AppointmentId}", appointment.Id);
                    return;
                }

                // Get room information
                var room = appointment.RoomId.HasValue ? await _roomService.GetByIdAsync(appointment.RoomId.Value) : null;

                // Get appointment type
                var appointmentType = appointment.AppointmentTypeId.HasValue ?
                    await _appointmentTypeService.GetAppointmentTypeByIdAsync(appointment.AppointmentTypeId.Value) : null;

                var clinicName = clinic?.Name ?? "Paw Track Veterinary Clinic";
                var subject = $"📅 Appointment Confirmation - {clinicName}";
                var body = $@"
<!DOCTYPE html PUBLIC ""-//W3C//DTD XHTML 1.0 Transitional//EN"" ""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"">
<html xmlns=""http://www.w3.org/1999/xhtml"">
<head>
    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
    <title>Appointment Confirmation</title>
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
                            <h1 style=""margin: 0; padding: 0; font-size: 28px; font-weight: bold; color: #ffffff;"">📅 Appointment Confirmation</h1>
                            <p style=""margin: 10px 0 0 0; padding: 0; font-size: 16px; color: #ffffff;"">{clinicName}</p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style=""padding: 30px;"">
                            
                            <!-- Greeting -->
                            <p style=""margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Dear {client.FirstName} {client.LastName},
                            </p>

                            <!-- Confirmation Message -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #dbf3f0; border-left: 4px solid #225F69;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                            Your appointment has been <strong style=""color: #225F69;"">confirmed</strong>! We look forward to seeing you and {patient.Name}.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Appointment Details Section -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <h2 style=""margin: 0 0 15px 0; font-size: 20px; color: #225F69; border-bottom: 2px solid #225F69; padding-bottom: 10px;"">
                                            📋 Appointment Details
                                        </h2>
                                        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold; width: 40%;"">Patient:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{patient.Name}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Date:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{appointment.AppointmentDate:dddd, MMMM dd, yyyy}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Time:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{(appointment.AppointmentTimeFrom.HasValue ? appointment.AppointmentTimeFrom.Value.ToString(@"hh\:mm") : appointment.AppointmentDate.ToString("hh:mm tt"))}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Clinic:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{clinic.Name}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Type:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{appointmentType?.Name ?? "General Consultation"}</td>
                                            </tr>
                                            {(room != null ? $@"
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Room:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{room.Name}</td>
                                            </tr>" : "")}
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Important Information Section -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <h2 style=""margin: 0 0 15px 0; font-size: 20px; color: #225F69; border-bottom: 2px solid #225F69; padding-bottom: 10px;"">
                                            ℹ️ Important Information
                                        </h2>
                                        <p style=""margin: 0; font-size: 16px; color: #333333; line-height: 1.8;"">
                                            • Please arrive 10-15 minutes before your scheduled appointment time<br/>
                                            • Bring any relevant medical records or previous test results<br/>
                                            • If you need to reschedule or cancel, please contact us at least 24 hours in advance<br/>
                                            • For emergencies, please call us immediately
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Important Notice -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #fff8e1; border: 1px solid #ffb300;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0; font-size: 14px; color: #333333; line-height: 1.5;"">
                                            <strong>📞 Questions?</strong> If you have any questions or need to make changes to your appointment, please don't hesitate to contact us.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Closing -->
                            <p style=""margin: 20px 0 10px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                We look forward to seeing you and {patient.Name}!
                            </p>

                            <p style=""margin: 10px 0 0 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Best regards,<br/>
                                <strong>The {clinicName} Team</strong>
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
                _logger.LogInformation("Appointment confirmation email sent to {ClientEmail} for appointment {AppointmentId}", client.Email, appointment.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending appointment confirmation email for appointment {AppointmentId}", appointment.Id);
                // Don't throw the exception to avoid breaking the appointment update process
            }
        }

        /// <summary>
        /// Get current user ID from HttpContext claims
        /// </summary>
        private Guid? GetCurrentUserId()
        {
            try
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                
                if (Guid.TryParse(userIdClaim, out var userId))
                {
                    return userId;
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error getting current user ID from HttpContext");
                return null;
            }
        }
    }
}
