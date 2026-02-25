using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Api.Hubs;
using System.Text.Json;
using AutoMapper;

namespace Api.Services
{
    /// <summary>
    /// Service for managing real-time notifications via SignalR
    /// </summary>
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IUserRepository _userRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IHubContext<NotificationHub> hubContext,
            IUserRepository userRepository,
            INotificationRepository notificationRepository,
            IMapper mapper,
            ILogger<NotificationService> logger)
        {
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _notificationRepository = notificationRepository ?? throw new ArgumentNullException(nameof(notificationRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task SendNotificationToUserAsync(Guid userId, NotificationDto notification)
        {
            try
            {
                // Persist notification to database first
                try
                {
                    var notificationModel = _mapper.Map<Notification>(notification);
                    notificationModel.UserId = userId;
                    notificationModel.Data = notification.Data != null ? JsonSerializer.Serialize(notification.Data) : null;
                    await _notificationRepository.CreateAsync(notificationModel);
                    _logger.LogDebug("Notification persisted to database for user {UserId}: {Type}", userId, notification.Type);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to persist notification to database for user {UserId}, continuing with real-time send", userId);
                    // Continue with real-time send even if persistence fails
                }

                // Send real-time notification if user is connected
                if (NotificationHub.IsUserConnected(userId))
                {
                    await _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", notification);
                    _logger.LogDebug("Real-time notification sent to user {UserId}: {Type}", userId, notification.Type);
                }
                else
                {
                    _logger.LogDebug("User {UserId} is not connected, notification persisted but not sent in real-time", userId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification to user {UserId}", userId);
                // Don't throw - notifications are non-critical
            }
        }

        /// <summary>
        /// Sends a notification to a client by Client.Id: persists to DB and sends real-time via SignalR.
        /// Clients log in with JWT Sub = client.Id and join SignalR group "user_{clientId}".
        /// </summary>
        private async Task SendNotificationToClientAsync(Guid clientId, NotificationDto notification)
        {
            try
            {
                try
                {
                    var notificationModel = _mapper.Map<Notification>(notification);
                    notificationModel.UserId = null;
                    notificationModel.ClientId = clientId;
                    notificationModel.Data = notification.Data != null ? JsonSerializer.Serialize(notification.Data) : null;
                    await _notificationRepository.CreateAsync(notificationModel);
                    _logger.LogDebug("Notification persisted to database for client {ClientId}: {Type}", clientId, notification.Type);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to persist notification to database for client {ClientId}, continuing with real-time send", clientId);
                }


                if (NotificationHub.IsUserConnected(clientId))
                {
                    await _hubContext.Clients.Group($"user_{clientId}").SendAsync("ReceiveNotification", notification);
                    _logger.LogDebug("Real-time notification sent to client {ClientId}: {Type}", clientId, notification.Type);
                }
                else
                {
                    _logger.LogDebug("Client {ClientId} is not connected to NotificationHub", clientId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification to client {ClientId}", clientId);
            }
        }

        public async Task SendNotificationToClinicAsync(Guid clinicId, NotificationDto notification)
        {
            try
            {
                // Get all users associated with this clinic (clinic admins and veterinarians)
                var users = await GetClinicUsersAsync(clinicId);
                
                if (users.Count == 0)
                {
                    _logger.LogDebug("No users found for clinic {ClinicId}, skipping notification", clinicId);
                    return;
                }
                
                var tasks = users.Select(userId => SendNotificationToUserAsync(userId, notification));
                await Task.WhenAll(tasks);
                
                _logger.LogInformation("Notification sent to {Count} users in clinic {ClinicId}: {Type}", 
                    users.Count, clinicId, notification.Type);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification to clinic {ClinicId}", clinicId);
                // Don't throw - notifications are non-critical
            }
        }

        public async Task SendAppointmentNotificationAsync(Guid clinicId, Guid? veterinarianId, AppointmentNotificationDataDto appointmentData, Guid? clientUserId = null)
        {
            try
            {
                // Optimize: Get clinic admins and veterinarians in a single query
                var usersToNotify = await GetClinicAdminsAndVeterinariansAsync(clinicId, veterinarianId);

                // Format appointment date and time slot (used for both staff and client notifications)
                var appointmentDateFormatted = appointmentData.AppointmentDate.ToString("MMMM dd, yyyy");
                var timeSlot = "";
                if (appointmentData.AppointmentTimeFrom.HasValue && appointmentData.AppointmentTimeTo.HasValue)
                {
                    var timeFrom = FormatTimeSpan(appointmentData.AppointmentTimeFrom.Value);
                    var timeTo = FormatTimeSpan(appointmentData.AppointmentTimeTo.Value);
                    timeSlot = $" from {timeFrom} to {timeTo}";
                }
                else if (appointmentData.AppointmentTimeFrom.HasValue)
                {
                    var timeFrom = FormatTimeSpan(appointmentData.AppointmentTimeFrom.Value);
                    timeSlot = $" at {timeFrom}";
                }

                // Notify clinic admin and veterinarian
                if (usersToNotify.Count > 0)
                {
                    var staffNotification = new NotificationDto
                    {
                        Type = "appointment_created",
                        Title = "New Appointment Requested",
                        Message = $"{appointmentData.ClientName} has requested an appointment for {appointmentDateFormatted}{timeSlot}",
                        Timestamp = appointmentData.AppointmentDate,
                        Data = appointmentData
                    };
                    var staffTasks = usersToNotify.Select(userId => SendNotificationToUserAsync(userId, staffNotification));
                    await Task.WhenAll(staffTasks);
                    _logger.LogInformation("Appointment notification sent to {Count} users (clinic admin/vet) for appointment {AppointmentId} in clinic {ClinicId}",
                        usersToNotify.Count, appointmentData.AppointmentId, clinicId);
                }
                else
                {
                    _logger.LogDebug("No users to notify for appointment {AppointmentId} in clinic {ClinicId}", appointmentData.AppointmentId, clinicId);
                }

                // Notify client ("Appointment registered successfully")
                // Clients may log in as User (same email) or as Client (clients table); both join SignalR group "user_{id}"
                var clientNotification = new NotificationDto
                {
                    Type = "appointment_registered",
                    Title = "Appointment Registered Successfully",
                    Message = $"Your appointment for {appointmentDateFormatted}{timeSlot} has been registered successfully.",
                    Timestamp = DateTime.UtcNow,
                    Data = appointmentData
                };
                if (clientUserId.HasValue)
                {
                    await SendNotificationToUserAsync(clientUserId.Value, clientNotification);
                    _logger.LogInformation("Appointment registered notification sent to client user {ClientUserId} for appointment {AppointmentId}",
                        clientUserId.Value, appointmentData.AppointmentId);
                }
                else if (appointmentData.ClientId != Guid.Empty)
                {
                    // Client has no User record (e.g. registered via client portal); send real-time only to group "user_{clientId}"
                    await SendNotificationToClientAsync(appointmentData.ClientId, clientNotification);
                    _logger.LogInformation("Appointment registered notification sent to client (by ClientId) {ClientId} for appointment {AppointmentId}",
                        appointmentData.ClientId, appointmentData.AppointmentId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending appointment notification for clinic {ClinicId}", clinicId);
                // Don't throw - notifications are non-critical
            }
        }

        public async Task SendAppointmentCancellationNotificationAsync(Guid clinicId, Guid? veterinarianId, Guid? clientId, AppointmentNotificationDataDto appointmentData, bool cancelledByVeterinarian)
        {
            try
            {
                // Format appointment date and time slot
                var appointmentDateFormatted = appointmentData.AppointmentDate.ToString("MMMM dd, yyyy");
                var timeSlot = "";
                if (appointmentData.AppointmentTimeFrom.HasValue && appointmentData.AppointmentTimeTo.HasValue)
                {
                    var timeFrom = FormatTimeSpan(appointmentData.AppointmentTimeFrom.Value);
                    var timeTo = FormatTimeSpan(appointmentData.AppointmentTimeTo.Value);
                    timeSlot = $" from {timeFrom} to {timeTo}";
                }
                else if (appointmentData.AppointmentTimeFrom.HasValue)
                {
                    var timeFrom = FormatTimeSpan(appointmentData.AppointmentTimeFrom.Value);
                    timeSlot = $" at {timeFrom}";
                }

                var cancellationMessage = $"Appointment for {appointmentDateFormatted}{timeSlot} has been cancelled";

                // If cancelled by veterinarian: notify client and clinic admin
                if (cancelledByVeterinarian)
                {
                    // Notify clinic admin
                    var clinicAdmins = await GetClinicAdminsAsync(clinicId);
                    var adminNotification = new NotificationDto
                    {
                        Type = "appointment_cancelled",
                        Title = "Appointment Cancelled",
                        Message = $"{appointmentData.ClientName}'s appointment for {appointmentDateFormatted}{timeSlot} has been cancelled by the veterinarian",
                        Timestamp = DateTime.UtcNow,
                        Data = appointmentData
                    };

                    var adminTasks = clinicAdmins.Select(adminId => SendNotificationToUserAsync(adminId, adminNotification));
                    await Task.WhenAll(adminTasks);

                    // Notify client (by User id if they have an account, else by Client id for real-time only)
                    var clientCancellationNotification = new NotificationDto
                    {
                        Type = "appointment_cancelled",
                        Title = "Appointment Cancelled",
                        Message = $"Your appointment for {appointmentDateFormatted}{timeSlot} has been cancelled",
                        Timestamp = DateTime.UtcNow,
                        Data = appointmentData
                    };
                    if (clientId.HasValue)
                        await SendNotificationToUserAsync(clientId.Value, clientCancellationNotification);
                    else if (appointmentData.ClientId != Guid.Empty)
                        await SendNotificationToClientAsync(appointmentData.ClientId, clientCancellationNotification);

                    _logger.LogInformation("Cancellation notification sent to clinic admin and client for appointment {AppointmentId} (cancelled by veterinarian)", 
                        appointmentData.AppointmentId);
                }
                else
                {
                    // If cancelled by clinic admin: notify client and veterinarian
                    // Notify veterinarian
                    if (veterinarianId.HasValue)
                    {
                        var vetNotification = new NotificationDto
                        {
                            Type = "appointment_cancelled",
                            Title = "Appointment Cancelled",
                            Message = $"{appointmentData.ClientName}'s appointment for {appointmentDateFormatted}{timeSlot} has been cancelled by clinic admin",
                            Timestamp = DateTime.UtcNow,
                            Data = appointmentData
                        };
                        await SendNotificationToUserAsync(veterinarianId.Value, vetNotification);
                    }

                    // Notify client (by User id if they have an account, else by Client id for real-time only)
                    var clientCancellationNotification2 = new NotificationDto
                    {
                        Type = "appointment_cancelled",
                        Title = "Appointment Cancelled",
                        Message = $"Your appointment for {appointmentDateFormatted}{timeSlot} has been cancelled",
                        Timestamp = DateTime.UtcNow,
                        Data = appointmentData
                    };
                    if (clientId.HasValue)
                        await SendNotificationToUserAsync(clientId.Value, clientCancellationNotification2);
                    else if (appointmentData.ClientId != Guid.Empty)
                        await SendNotificationToClientAsync(appointmentData.ClientId, clientCancellationNotification2);

                    _logger.LogInformation("Cancellation notification sent to veterinarian and client for appointment {AppointmentId} (cancelled by clinic admin)", 
                        appointmentData.AppointmentId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending cancellation notification for appointment {AppointmentId}", appointmentData.AppointmentId);
                // Don't throw - notifications are non-critical
            }
        }

        /// <summary>
        /// Get clinic admins for a clinic
        /// </summary>
        private async Task<List<Guid>> GetClinicAdminsAsync(Guid clinicId)
        {
            try
            {
                var users = await _userRepository.GetAllAsync(1, int.MaxValue, null, new[] { clinicId }, false);
                var adminIds = users.Items
                    .Where(u => u.RoleName != null && 
                               (u.RoleName.Equals("Clinic Admin", StringComparison.OrdinalIgnoreCase) ||
                                u.RoleName.Equals("clinic_admin", StringComparison.OrdinalIgnoreCase) ||
                                (u.RoleValue != null && u.RoleValue.Equals("clinic_admin", StringComparison.OrdinalIgnoreCase))))
                    .Select(u => u.Id)
                    .ToList();

                return adminIds;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting clinic admins for clinic {ClinicId}", clinicId);
                return new List<Guid>();
            }
        }

        /// <summary>
        /// Format TimeSpan to 12-hour format with AM/PM
        /// </summary>
        private string FormatTimeSpan(TimeSpan timeSpan)
        {
            var hours = timeSpan.Hours;
            var minutes = timeSpan.Minutes;
            var amPm = hours >= 12 ? "PM" : "AM";
            var displayHours = hours > 12 ? hours - 12 : (hours == 0 ? 12 : hours);
            return $"{displayHours}:{minutes:D2} {amPm}";
        }

        /// <summary>
        /// Get all users (admins and veterinarians) associated with a clinic
        /// </summary>
        private async Task<List<Guid>> GetClinicUsersAsync(Guid clinicId)
        {
            try
            {
                var users = await _userRepository.GetAllAsync(1, int.MaxValue, null, new[] { clinicId }, false);
                var userIds = users.Items
                    .Where(u => u.RoleName != null && 
                               ((u.RoleName.Equals("Clinic Admin", StringComparison.OrdinalIgnoreCase) ||
                                 u.RoleName.Equals("clinic_admin", StringComparison.OrdinalIgnoreCase) ||
                                 (u.RoleValue != null && u.RoleValue.Equals("clinic_admin", StringComparison.OrdinalIgnoreCase))) ||
                                (u.RoleName.Equals("Veterinarian", StringComparison.OrdinalIgnoreCase) ||
                                 u.RoleName.Equals("veterinarian", StringComparison.OrdinalIgnoreCase) ||
                                 (u.RoleValue != null && u.RoleValue.Equals("veterinarian", StringComparison.OrdinalIgnoreCase)))))
                    .Select(u => u.Id)
                    .ToList();

                return userIds;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting clinic users for clinic {ClinicId}", clinicId);
                return new List<Guid>(); // Return empty list instead of throwing
            }
        }

        /// <summary>
        /// Optimized: Get clinic admins and optionally include a specific veterinarian in a single query
        /// </summary>
        private async Task<List<Guid>> GetClinicAdminsAndVeterinariansAsync(Guid clinicId, Guid? veterinarianId)
        {
            try
            {
                var users = await _userRepository.GetAllAsync(1, int.MaxValue, null, new[] { clinicId }, false);
                
                var userIds = new HashSet<Guid>();
                
                // Get clinic admins - check both role name and role value for compatibility
                var adminIds = users.Items
                    .Where(u => u.RoleName != null && 
                               (u.RoleName.Equals("Clinic Admin", StringComparison.OrdinalIgnoreCase) ||
                                u.RoleName.Equals("clinic_admin", StringComparison.OrdinalIgnoreCase) ||
                                (u.RoleValue != null && u.RoleValue.Equals("clinic_admin", StringComparison.OrdinalIgnoreCase))))
                    .Select(u => u.Id);
                
                foreach (var id in adminIds)
                {
                    userIds.Add(id);
                }

                // Add the specific veterinarian if provided
                if (veterinarianId.HasValue)
                {
                    userIds.Add(veterinarianId.Value);
                }

                return userIds.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting clinic admins and veterinarians for clinic {ClinicId}", clinicId);
                return new List<Guid>(); // Return empty list instead of throwing
            }
        }
    }
}

