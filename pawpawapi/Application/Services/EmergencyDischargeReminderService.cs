using Application.DTOs;
using Application.Interfaces;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public class EmergencyDischargeReminderService : IEmergencyDischargeReminderService
    {
        private readonly IEmergencyDischargeReminderRepository _reminderRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<EmergencyDischargeReminderService> _logger;
        private readonly int _reminderDaysBefore;
        private readonly string _bookingUrl;

        public EmergencyDischargeReminderService(
            IEmergencyDischargeReminderRepository reminderRepository,
            IEmailService emailService,
            ILogger<EmergencyDischargeReminderService> logger,
            IConfiguration configuration)
        {
            _reminderRepository = reminderRepository;
            _emailService = emailService;
            _logger = logger;
            // Get ReminderDaysBefore from configuration, default to 2 if not set
            var reminderDaysStr = configuration["EmergencyDischargeReminder:ReminderDaysBefore"];
            _reminderDaysBefore = !string.IsNullOrEmpty(reminderDaysStr) && int.TryParse(reminderDaysStr, out int days) ? days : 2;
            // Get BookingUrl from configuration
            _bookingUrl = configuration["EmergencyDischargeReminder:BookingUrl"] ?? "https://petpalace.xcdify.com/appointments";
        }

        public async Task<ReminderResponseDto> ProcessEmergencyDischargeRemindersAsync()
        {
            var response = new ReminderResponseDto
            {
                ProcessedAt = DateTimeOffset.UtcNow,
                Success = false
            };

            try
            {
                _logger.LogInformation("Starting emergency discharge reminder processing at {Time}", DateTimeOffset.UtcNow);

                // Get reminders for follow-up dates due from today to configured days from now
                var today = DateTime.UtcNow.Date;
                var futureDate = today.AddDays(_reminderDaysBefore);

                List<EmergencyDischargeReminder> reminders;

                try
                {
                    reminders = await _reminderRepository.GetEmergencyDischargeRemindersDueAsync(today, futureDate);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to fetch emergency discharge reminders from database");
                    response.Message = "Failed to fetch emergency discharge reminders from database";
                    response.Errors.Add($"Database Error: {ex.Message}");
                    return response;
                }

                _logger.LogInformation("Found {Count} emergency discharge reminders to process (due within {Days} days)", reminders.Count, _reminderDaysBefore);
                response.TotalRemindersProcessed = reminders.Count;

                // Group reminders by days until due to send different emails
                var remindersByDays = new Dictionary<int, List<EmergencyDischargeReminder>>();

                foreach (var reminder in reminders)
                {
                    try
                    {
                        // Calculate days until follow-up date
                        var daysUntilFollowup = (reminder.FollowupDate.Date - DateTime.UtcNow.Date).Days;

                        if (!remindersByDays.ContainsKey(daysUntilFollowup))
                        {
                            remindersByDays[daysUntilFollowup] = new List<EmergencyDischargeReminder>();
                        }
                        remindersByDays[daysUntilFollowup].Add(reminder);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex,
                            "Failed to calculate follow-up date for {Email}, patient {PatientName}",
                            reminder.ClientEmail, reminder.PatientName);
                        response.Errors.Add($"Failed to calculate follow-up date for {reminder.PatientName}: {ex.Message}");
                    }
                }

                // Track reminders by days
                foreach (var group in remindersByDays)
                {
                    response.RemindersByDaysUntilDue[group.Key] = group.Value.Count;
                }

                // Send different emails based on days until follow-up
                foreach (var group in remindersByDays)
                {
                    var daysUntil = group.Key;
                    var reminderList = group.Value;

                    _logger.LogInformation("Processing {Count} reminders for follow-ups due in {Days} day(s)",
                        reminderList.Count, daysUntil);

                    foreach (var reminder in reminderList)
                    {
                        try
                        {
                            await SendEmergencyDischargeReminderEmailAsync(reminder, daysUntil);
                            response.EmailsSent++;
                            _logger.LogInformation(
                                "Successfully sent {Type} emergency discharge reminder to {Email} for patient {PatientName}",
                                daysUntil == 0 ? "TODAY" : daysUntil == 1 ? "TOMORROW" : $"{daysUntil}-DAY",
                                reminder.ClientEmail, reminder.PatientName);
                        }
                        catch (Exception ex)
                        {
                            response.EmailsFailed++;
                            var errorMsg = $"Failed to send reminder to {reminder.ClientEmail} for {reminder.PatientName}: {ex.Message}";
                            response.Errors.Add(errorMsg);
                            _logger.LogError(ex,
                                "Failed to send emergency discharge reminder to {Email} for patient {PatientName}",
                                reminder.ClientEmail, reminder.PatientName);
                        }
                    }
                }

                // Determine overall success
                response.Success = response.EmailsFailed == 0 && response.Errors.Count == 0;

                if (response.Success)
                {
                    response.Message = $"Successfully processed {response.TotalRemindersProcessed} emergency discharge reminders and sent {response.EmailsSent} emails";
                }
                else if (response.EmailsSent > 0)
                {
                    response.Message = $"Partially successful: Sent {response.EmailsSent} emails, {response.EmailsFailed} failed";
                }
                else
                {
                    response.Message = $"Failed to send emails: {response.EmailsFailed} emails failed, {response.Errors.Count} errors encountered";
                }

                _logger.LogInformation("Completed emergency discharge reminder processing at {Time}. Success: {Success}, Sent: {Sent}, Failed: {Failed}",
                    DateTimeOffset.UtcNow, response.Success, response.EmailsSent, response.EmailsFailed);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical error processing emergency discharge reminders");
                response.Success = false;
                response.Message = "Critical error occurred during emergency discharge reminder processing";
                response.Errors.Add($"Critical Error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    response.Errors.Add($"Inner Exception: {ex.InnerException.Message}");
                }
                return response;
            }
        }

        private async Task SendEmergencyDischargeReminderEmailAsync(EmergencyDischargeReminder reminder, int daysUntilFollowup)
        {
            // Format the follow-up date
            var followupDateFormatted = reminder.FollowupDate.ToString("dddd, MMMM dd, yyyy");

            string urgencyMessage;
            string emailSubject;
            string headerIcon;
            string mainMessage;

            if (daysUntilFollowup == 0)
            {
                // Follow-up is TODAY
                urgencyMessage = "<strong style='color: #d32f2f;'>TODAY</strong>";
                emailSubject = $"🚨 URGENT: Follow-up Appointment Due TODAY for {reminder.PatientName}";
                headerIcon = "🚨";
                mainMessage = $"<strong>{reminder.PatientName}</strong>'s follow-up appointment is <strong style='color: #d32f2f; font-size: 18px;'>DUE TODAY</strong>! Please bring your pet in for their follow-up appointment as soon as possible.";
            }
            else if (daysUntilFollowup == 1)
            {
                // Follow-up is TOMORROW
                urgencyMessage = "<strong style='color: #225F69;'>TOMORROW</strong>";
                emailSubject = $"⚠️ Reminder: Follow-up Appointment Due Tomorrow for {reminder.PatientName}";
                headerIcon = "⚠️";
                mainMessage = $"<strong>{reminder.PatientName}</strong>'s follow-up appointment is <strong style='color: #225F69; font-size: 18px;'>DUE TOMORROW</strong>! Please ensure your pet is ready for their follow-up appointment.";
            }
            else
            {
                // Follow-up is in X days
                urgencyMessage = $"<strong style='color: #225F69;'>{daysUntilFollowup} days</strong>";
                emailSubject = $"📅 Reminder: Follow-up Appointment Due in {daysUntilFollowup} Days for {reminder.PatientName}";
                headerIcon = "📅";
                mainMessage = $"<strong>{reminder.PatientName}</strong>'s follow-up appointment is due in <strong style='color: #225F69; font-size: 18px;'>{daysUntilFollowup} days</strong>. Please prepare for your pet's follow-up appointment.";
            }

            // Create the HTML email content
            var emailContent = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Emergency Discharge Follow-up Reminder</title>
</head>
<body style='margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;'>
    <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%' style='background-color: #f5f5f5;'>
        <tr>
            <td align='center' style='padding: 20px 0;'>
                <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='600' style='max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    
                    <!-- Header -->
                    <tr>
                        <td style='background-color: #225F69; padding: 25px; text-align: center; color: white; border-radius: 8px 8px 0 0;'>
                            <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%'>
                                <tr>
                                    <td align='center' style='font-size: 32px; font-weight: bold; color: white;'>
                                        {headerIcon} Follow-up Reminder
                                    </td>
                                </tr>
                                <tr>
                                    <td align='center' style='font-size: 16px; color: white; opacity: 0.9; padding-top: 8px;'>
                                        Your pet's health is our priority
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 30px;'>
                            <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%'>
                                
                                <!-- Greeting -->
                                <tr>
                                    <td style='font-size: 16px; color: #333; padding-bottom: 20px;'>
                                        Dear <strong>{reminder.ClientFirstName} {reminder.ClientLastName}</strong>,
                                    </td>
                                </tr>
                                
                                <!-- Main Reminder Message -->
                                <tr>
                                    <td style='padding-bottom: 25px;'>
                                        <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%' style='background-color: #dbf3f0; border-left: 4px solid #225F69; border-radius: 4px;'>
                                            <tr>
                                                <td style='padding: 20px;'>
                                                    <div style='font-size: 16px; color: #333; line-height: 1.5;'>
                                                        <strong>{reminder.PatientName}</strong>'s emergency discharge follow-up is due <strong style='color: #225F69;'>{urgencyMessage}</strong>. Please schedule an appointment if you haven't already.
                                                    </div>
                                                    <div style='font-size: 14px; color: #666; margin-top: 10px;'>
                                                        <strong>Date:</strong> {followupDateFormatted}
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Call to Action Button -->
                                <tr>
                                    <td style='padding-bottom: 30px; text-align: center;'>
                                        <table role='presentation' cellspacing='0' cellpadding='0' border='0' style='margin: 0 auto;'>
                                            <tr>
                                                <td style='background-color: #225F69; border-radius: 25px;'>
                                                    <a href='{_bookingUrl}' style='display: inline-block; padding: 15px 30px; color: white; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 25px; background-color: #225F69;'>
                                                        📅 Book Appointment Now
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <div style='font-size: 14px; color: #666; margin-top: 10px;'>
                                            Click the button above to schedule {reminder.PatientName}'s follow-up appointment
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Pet Information -->
                                <tr>
                                    <td style='padding-bottom: 25px;'>
                                        <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%'>
                                            <tr>
                                                <td style='font-size: 18px; font-weight: bold; color: #333; padding-bottom: 15px; border-bottom: 2px solid #225F69;'>
                                                    🐾 Pet Information
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='padding-top: 15px;'>
                                                    <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%'>
                                                        <tr>
                                                            <td style='padding-bottom: 8px; font-size: 14px; color: #333;'>
                                                                <strong>Pet Name:</strong> {reminder.PatientName}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style='padding-bottom: 8px; font-size: 14px; color: #333;'>
                                                                <strong>Species:</strong> {reminder.PatientSpecies}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style='padding-bottom: 8px; font-size: 14px; color: #333;'>
                                                                <strong>Breed:</strong> {reminder.PatientBreed ?? "Not specified"}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style='font-size: 14px; color: #333;'>
                                                                <strong>Follow-up Date:</strong> {followupDateFormatted}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Emergency Discharge Details -->
                                <tr>
                                    <td style='padding-bottom: 25px;'>
                                        <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%'>
                                            <tr>
                                                <td style='font-size: 18px; font-weight: bold; color: #333; padding-bottom: 15px; border-bottom: 2px solid #225F69;'>
                                                    🏥 Emergency Discharge Details
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='padding-top: 15px;'>
                                                    <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%'>
                                                        <tr>
                                                            <td style='padding-bottom: 8px; font-size: 14px; color: #333;'>
                                                                <strong>Due Date:</strong> {followupDateFormatted}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style='padding-bottom: 8px; font-size: 14px; color: #333;'>
                                                                <strong>Discharge Status:</strong> {reminder.DischargeStatus}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style='padding-bottom: 8px; font-size: 14px; color: #333;'>
                                                                <strong>Responsible Clinician:</strong> {reminder.ResponsibleClinician ?? "Not specified"}
                                                            </td>
                                                        </tr>";

            // Add Follow-up Instructions if available
            if (!string.IsNullOrEmpty(reminder.FollowupInstructions))
            {
                emailContent += $@"
                                                        <tr>
                                                            <td style='padding-bottom: 8px; font-size: 14px; color: #333;'>
                                                                <strong>Summary:</strong> {reminder.FollowupInstructions}
                                                            </td>
                                                        </tr>";
            }

            emailContent += $@"
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Important Alert Box -->
                                <tr>
                                    <td style='padding-bottom: 25px;'>
                                        <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%' style='background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;'>
                                            <tr>
                                                <td style='padding: 15px;'>
                                                    <div style='font-size: 14px; color: #333; line-height: 1.5;'>
                                                        <strong style='color: #856404;'>⚠️ Important:</strong> Click the ""Book Appointment Now"" button above to schedule {reminder.PatientName}'s emergency discharge follow-up appointment. Regular follow-up care is crucial for your pet's recovery and helps ensure the best possible outcome.
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>";

            // Add Home Care Instructions if available
            if (!string.IsNullOrEmpty(reminder.HomeCareInstructions))
            {
                emailContent += $@"
                                <!-- Home Care Instructions -->
                                <tr>
                                    <td style='padding-bottom: 25px;'>
                                        <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%'>
                                            <tr>
                                                <td style='font-size: 16px; font-weight: bold; color: #333; padding-bottom: 10px;'>
                                                    <strong>Home Care Instructions:</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='font-size: 14px; color: #333; line-height: 1.5;'>
                                                    {reminder.HomeCareInstructions}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>";
            }

            emailContent += $@"
                                <!-- Contact Information -->
                                <tr>
                                    <td style='padding-bottom: 25px;'>
                                        <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%'>
                                            <tr>
                                                <td style='font-size: 16px; font-weight: bold; color: #333; padding-bottom: 10px;'>
                                                    <strong>Contact Information:</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='font-size: 14px; color: #333; line-height: 1.5;'>
                                                    <strong>Clinic:</strong> {reminder.ClinicName}<br>
                                                    <strong>Phone:</strong> {reminder.ClinicPhone ?? "Not available"}<br>
                                                    <strong>Email:</strong> {reminder.ClinicEmail ?? "Not available"}<br>";

            if (!string.IsNullOrEmpty(reminder.ClinicAddress))
            {
                emailContent += $@"                                                    <strong>Address:</strong> {reminder.ClinicAddress}";
            }

            emailContent += $@"
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Closing Message -->
                                <tr>
                                    <td style='padding-bottom: 20px;'>
                                        <div style='font-size: 14px; color: #333; line-height: 1.5;'>
                                            We look forward to seeing you and {reminder.PatientName} soon!
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style='padding-bottom: 20px;'>
                                        <div style='font-size: 14px; color: #333;'>
                                            Best regards,<br>
                                            <strong>The {reminder.ClinicName} Team</strong>
                                        </div>
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td align='center' style='padding: 20px;'>
                <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='600' style='max-width: 600px;'>
                    <tr>
                        <td style='text-align: center; font-size: 12px; color: #666; line-height: 1.5;'>
                            <div>This is an automated follow-up reminder. Please do not reply to this email.</div>
                            <div>Click the ""Book Appointment Now"" button above to schedule your pet's follow-up appointment.</div>
                            <div style='margin-top: 10px;'>
                                &copy; {DateTime.Now.Year} {reminder.CompanyName}. All rights reserved.
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
    </table>
</body>
</html>";

            await _emailService.SendEmailAsync(
                reminder.ClientEmail,
                emailSubject,
                emailContent
            );
        }
    }
}
