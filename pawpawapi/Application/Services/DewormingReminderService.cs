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
    public class DewormingReminderService : IDewormingReminderService
    {
        private readonly IDewormingReminderRepository _reminderRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<DewormingReminderService> _logger;
        private readonly int _reminderDaysBefore;
        private readonly string _bookingUrl;

        public DewormingReminderService(
            IDewormingReminderRepository reminderRepository,
            IEmailService emailService,
            ILogger<DewormingReminderService> logger,
            IConfiguration configuration)
        {
            _reminderRepository = reminderRepository;
            _emailService = emailService;
            _logger = logger;
            // Get ReminderDaysBefore from configuration, default to 2 if not set
            var reminderDaysStr = configuration["DewormingReminder:ReminderDaysBefore"];
            _reminderDaysBefore = !string.IsNullOrEmpty(reminderDaysStr) && int.TryParse(reminderDaysStr, out int days) ? days : 2;
            // Get BookingUrl from configuration
            _bookingUrl = configuration["DewormingReminder:BookingUrl"] ?? "https://petpalace.xcdify.com/appointments";
        }

        public async Task<ReminderResponseDto> ProcessDewormingRemindersAsync()
        {
            var response = new ReminderResponseDto
            {
                ProcessedAt = DateTimeOffset.UtcNow,
                Success = false
            };

            try
            {
                _logger.LogInformation("Starting deworming reminder processing at {Time}", DateTimeOffset.UtcNow);

                // Get reminders for dewormings due from today to configured days from now
                var today = DateTimeOffset.UtcNow.Date;
                var futureDate = today.AddDays(_reminderDaysBefore);

                List<DewormingReminder> reminders;
                
                try
                {
                    reminders = await _reminderRepository.GetDewormingRemindersDueAsync(today, futureDate);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to fetch deworming reminders from database");
                    response.Message = "Failed to fetch deworming reminders from database";
                    response.Errors.Add($"Database Error: {ex.Message}");
                    return response;
                }

                _logger.LogInformation("Found {Count} deworming reminders to process (due within {Days} days)", reminders.Count, _reminderDaysBefore);
                response.TotalRemindersProcessed = reminders.Count;

                // Group reminders by days until due to send different emails
                var remindersByDays = new Dictionary<int, List<DewormingReminder>>();

                foreach (var reminder in reminders)
                {
                    try
                    {
                        // Calculate days until deworming (comparing dates only, ignoring time)
                        var daysUntilDeworming = (reminder.NextDewormingDueDate.Date - today).Days;
                        
                        if (!remindersByDays.ContainsKey(daysUntilDeworming))
                        {
                            remindersByDays[daysUntilDeworming] = new List<DewormingReminder>();
                        }
                        remindersByDays[daysUntilDeworming].Add(reminder);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, 
                            "Failed to process deworming date for {Email}, patient {PatientName}",
                            reminder.ClientEmail, reminder.PatientName);
                        response.Errors.Add($"Failed to process deworming data for {reminder.PatientName}: {ex.Message}");
                    }
                }

                // Track reminders by days
                foreach (var group in remindersByDays)
                {
                    response.RemindersByDaysUntilDue[group.Key] = group.Value.Count;
                }

                // Send different emails based on days until deworming
                foreach (var group in remindersByDays)
                {
                    var daysUntil = group.Key;
                    var reminderList = group.Value;

                    _logger.LogInformation("Processing {Count} reminders for dewormings due in {Days} day(s)", 
                        reminderList.Count, daysUntil);

                    foreach (var reminder in reminderList)
                    {
                        try
                        {
                            await SendDewormingReminderEmailAsync(reminder, daysUntil);
                            response.EmailsSent++;
                            _logger.LogInformation(
                                "Successfully sent {Type} deworming reminder to {Email} for patient {PatientName}",
                                daysUntil == 0 ? "TODAY" : daysUntil == 1 ? "TOMORROW" : $"{daysUntil}-DAY",
                                reminder.ClientEmail, reminder.PatientName);
                        }
                        catch (Exception ex)
                        {
                            response.EmailsFailed++;
                            var errorMsg = $"Failed to send reminder to {reminder.ClientEmail} for {reminder.PatientName}: {ex.Message}";
                            response.Errors.Add(errorMsg);
                            _logger.LogError(ex,
                                "Failed to send deworming reminder to {Email} for patient {PatientName}",
                                reminder.ClientEmail, reminder.PatientName);
                        }
                    }
                }

                // Determine overall success
                response.Success = response.EmailsFailed == 0 && response.Errors.Count == 0;
                
                if (response.Success)
                {
                    response.Message = $"Successfully processed {response.TotalRemindersProcessed} deworming reminders and sent {response.EmailsSent} emails";
                }
                else if (response.EmailsSent > 0)
                {
                    response.Message = $"Partially successful: Sent {response.EmailsSent} emails, {response.EmailsFailed} failed";
                }
                else
                {
                    response.Message = $"Failed to send emails: {response.EmailsFailed} emails failed, {response.Errors.Count} errors encountered";
                }

                _logger.LogInformation("Completed deworming reminder processing at {Time}. Success: {Success}, Sent: {Sent}, Failed: {Failed}", 
                    DateTimeOffset.UtcNow, response.Success, response.EmailsSent, response.EmailsFailed);
                    
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical error processing deworming reminders");
                response.Success = false;
                response.Message = "Critical error occurred during deworming reminder processing";
                response.Errors.Add($"Critical Error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    response.Errors.Add($"Inner Exception: {ex.InnerException.Message}");
                }
                return response;
            }
        }


        private async Task SendDewormingReminderEmailAsync(DewormingReminder reminder, int daysUntilDeworming)
        {
            // Format the next due date (date and day only, no time)
            var dueDateFormatted = reminder.NextDewormingDueDate.ToString("dddd, MMMM dd, yyyy");

            string urgencyMessage;
            string emailSubject;
            string headerIcon;
            string mainMessage;

            if (daysUntilDeworming == 0)
            {
                // Deworming is TODAY
                urgencyMessage = "<strong style='color: #d32f2f;'>TODAY</strong>";
                emailSubject = $"🚨 URGENT: Deworming Due TODAY for {reminder.PatientName}";
                headerIcon = "🚨";
                mainMessage = $"<strong>{reminder.PatientName}</strong>'s deworming is <strong style='color: #d32f2f; font-size: 18px;'>DUE TODAY</strong>! Please bring your pet in for their deworming treatment as soon as possible.";
            }
            else if (daysUntilDeworming == 1)
            {
                // Deworming is TOMORROW
                urgencyMessage = "<strong style='color: #225F69;'>TOMORROW</strong>";
                emailSubject = $"⚠️ Reminder: Deworming Due Tomorrow for {reminder.PatientName}";
                headerIcon = "⚠️";
                mainMessage = $"<strong>{reminder.PatientName}</strong>'s deworming is due <strong style='color: #225F69; font-size: 18px;'>TOMORROW</strong>. Please schedule an appointment if you haven't already.";
            }
            else
            {
                // Deworming is in 2+ days
                urgencyMessage = $"<strong style='color: #225F69;'>in {daysUntilDeworming} days</strong>";
                emailSubject = $"📅 Deworming Reminder for {reminder.PatientName} - Due in {daysUntilDeworming} Days";
                headerIcon = "📅";
                mainMessage = $"This is a friendly reminder that <strong>{reminder.PatientName}</strong>'s deworming treatment is due {urgencyMessage}.";
            }

            var subject = emailSubject;

            // Determine button color based on urgency
            string buttonColor = daysUntilDeworming == 0 ? "#d32f2f" : "#225F69";
            string buttonHoverColor = daysUntilDeworming == 0 ? "#c62828" : "#1a4450";
            string alertBgColor = daysUntilDeworming == 0 ? "#ffebee" : "#dbf3f0";
            string alertBorderColor = daysUntilDeworming == 0 ? "#d32f2f" : "#225F69";
            string headerBgColor = daysUntilDeworming == 0 ? "#d32f2f" : "#225F69";

            var body = $@"
<!DOCTYPE html PUBLIC ""-//W3C//DTD XHTML 1.0 Transitional//EN"" ""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"">
<html xmlns=""http://www.w3.org/1999/xhtml"">
<head>
    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
    <title>Deworming Reminder</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;"">
    <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f5f5f5; padding: 20px 0;"">
        <tr>
            <td align=""center"">
                <!-- Main Container -->
                <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""600"" style=""background-color: #ffffff; max-width: 600px;"">
                    
                    <!-- Header -->
                    <tr>
                        <td bgcolor=""{headerBgColor}"" style=""padding: 40px 30px; text-align: center; color: #ffffff;"">
                            <h1 style=""margin: 0; padding: 0; font-size: 28px; font-weight: bold; color: #ffffff;"">{headerIcon} Deworming Reminder</h1>
                            <p style=""margin: 10px 0 0 0; padding: 0; font-size: 16px; color: #ffffff;"">It's time to protect your pet!</p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style=""padding: 30px;"">
                            
                            <!-- Greeting -->
                            <p style=""margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Dear {reminder.ClientFirstName} {reminder.ClientLastName},
                            </p>

                            <!-- Alert Box -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: {alertBgColor}; border-left: 4px solid {alertBorderColor};"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                            {mainMessage}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Book Appointment Button -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 30px 0;"">
                                <tr>
                                    <td align=""center"">
                                        <table border=""0"" cellpadding=""0"" cellspacing=""0"">
                                            <tr>
                                                <td align=""center"" bgcolor=""{buttonColor}"" style=""border-radius: 30px; padding: 0;"">
                                                    <a href=""{_bookingUrl}"" target=""_blank"" style=""font-size: 18px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 30px; padding: 15px 40px; border: 1px solid {buttonColor}; display: inline-block;"">
                                                        📅 Book Appointment Now
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align=""center"" style=""padding-top: 10px;"">
                                        <p style=""margin: 0; font-size: 12px; color: #666666;"">
                                            Click the button above to schedule {reminder.PatientName}'s deworming treatment
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Pet Information Section -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <h2 style=""margin: 0 0 15px 0; font-size: 20px; color: #225F69; border-bottom: 2px solid #225F69; padding-bottom: 10px;"">
                                            🐾 Pet Information
                                        </h2>
                                        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold; width: 40%;"">Pet Name:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{reminder.PatientName}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Species:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{reminder.PatientSpecies}</td>
                                            </tr>
                                            {(!string.IsNullOrEmpty(reminder.PatientBreed) ? $@"
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Breed:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{reminder.PatientBreed}</td>
                                            </tr>" : "")}
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Deworming Details Section -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <h2 style=""margin: 0 0 15px 0; font-size: 20px; color: #225F69; border-bottom: 2px solid #225F69; padding-bottom: 10px;"">
                                            💊 Deworming Details
                                        </h2>
                                        <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold; width: 40%;"">Due Date:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{dueDateFormatted}</td>
                                            </tr>
                                            {(!string.IsNullOrEmpty(reminder.Summary) ? $@"
                                            <tr>
                                                <td style=""padding: 8px 0; color: #666666; font-weight: bold;"">Summary:</td>
                                                <td style=""padding: 8px 0; color: #333333;"">{reminder.Summary}</td>
                                            </tr>" : "")}
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Important Notice -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #fff8e1; border: 1px solid #ffb300;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0; font-size: 14px; color: #333333; line-height: 1.5;"">
                                            <strong>⚠️ Important:</strong> Click the ""Book Appointment Now"" button above to schedule {reminder.PatientName}'s deworming treatment. 
                                            Regular deworming is crucial for your pet's health and helps prevent intestinal parasites.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            {(!string.IsNullOrEmpty(reminder.HomeCareInstructions) ? $@"
                            <!-- Home Care Instructions -->
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 20px 0; background-color: #f9f9f9;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""margin: 0 0 5px 0; font-weight: bold; color: #666666;"">Home Care Instructions:</p>
                                        <p style=""margin: 0; font-size: 14px; color: #333333; line-height: 1.5;"">{reminder.HomeCareInstructions}</p>
                                    </td>
                                </tr>
                            </table>" : "")}

                            <!-- Closing -->
                            <p style=""margin: 20px 0 10px 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                We look forward to seeing you and {reminder.PatientName} soon!
                            </p>

                            <p style=""margin: 10px 0 0 0; font-size: 16px; color: #333333; line-height: 1.5;"">
                                Best regards,<br/>
                                <strong>The {reminder.CompanyName} Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td bgcolor=""#f5f5f5"" style=""padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;"">
                            <p style=""margin: 0 0 5px 0; color: #999999; font-size: 12px; line-height: 1.5;"">
                                This is an automated deworming reminder. Please do not reply to this email.
                            </p>
                            <p style=""margin: 5px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;"">
                                Click the ""Book Appointment Now"" button above to schedule your pet's deworming treatment.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>";


            await _emailService.SendEmailAsync(reminder.ClientEmail!, subject, body);
        }
    }
}

