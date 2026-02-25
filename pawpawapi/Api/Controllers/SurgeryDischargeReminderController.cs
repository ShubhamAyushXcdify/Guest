using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SurgeryDischargeReminderController : ControllerBase
    {
        private readonly ISurgeryDischargeReminderService _surgeryDischargeReminderService;
        private readonly ILogger<SurgeryDischargeReminderController> _logger;

        public SurgeryDischargeReminderController(
            ISurgeryDischargeReminderService surgeryDischargeReminderService,
            ILogger<SurgeryDischargeReminderController> logger)
        {
            _surgeryDischargeReminderService = surgeryDischargeReminderService ?? throw new ArgumentNullException(nameof(surgeryDischargeReminderService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Manually triggers surgery discharge reminder processing
        /// This endpoint allows manual execution of the reminder system for testing or immediate processing
        /// </summary>
        /// <returns>Result of the reminder processing operation</returns>
        [HttpPost("process")]
        [ProducesResponseType(typeof(ReminderResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ReminderResponseDto), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ReminderResponseDto>> ProcessReminders()
        {
            try
            {
                _logger.LogInformation("Manual surgery discharge reminder processing triggered at {Time}", DateTimeOffset.UtcNow);

                var result = await _surgeryDischargeReminderService.ProcessSurgeryDischargeRemindersAsync();

                if (result.Success)
                {
                    _logger.LogInformation(
                        "Manual surgery discharge reminder processing completed successfully. Processed: {Processed}, Sent: {Sent}",
                        result.TotalRemindersProcessed, result.EmailsSent);

                    return Ok(result);
                }
                else
                {
                    _logger.LogWarning(
                        "Manual surgery discharge reminder processing completed with errors. Processed: {Processed}, Sent: {Sent}, Failed: {Failed}, Errors: {ErrorCount}",
                        result.TotalRemindersProcessed, result.EmailsSent, result.EmailsFailed, result.Errors.Count);

                    // Return 200 OK even with errors, but include the error information in the response
                    // This allows the caller to see what happened and handle partial success scenarios
                    return Ok(result);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical error during manual surgery discharge reminder processing");

                var errorResult = new ReminderResponseDto
                {
                    Success = false,
                    Message = "Critical error occurred during surgery discharge reminder processing",
                    ProcessedAt = DateTimeOffset.UtcNow,
                    Errors = { $"Critical Error: {ex.Message}" }
                };

                if (ex.InnerException != null)
                {
                    errorResult.Errors.Add($"Inner Exception: {ex.InnerException.Message}");
                }

                return StatusCode(500, errorResult);
            }
        }

        /// <summary>
        /// Gets information about the surgery discharge reminder system
        /// </summary>
        /// <returns>Information about the reminder system configuration and status</returns>
        [HttpGet("info")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public ActionResult GetReminderInfo()
        {
            var info = new
            {
                SystemName = "Surgery Discharge Reminder System",
                Description = "Automatically sends reminder emails for surgery discharge follow-up appointments",
                Features = new[]
                {
                    "Automated daily processing via background job",
                    "Manual processing via API endpoint",
                    "HTML email templates with clinic branding",
                    "Urgency-based messaging (TODAY, TOMORROW, X days)",
                    "Comprehensive error handling and logging",
                    "Follow-up date tracking from surgery_discharge table"
                },
                DataSource = "surgery_discharge table (followup_date column)",
                EmailTriggers = new[]
                {
                    "TODAY: Urgent red messaging for same-day follow-ups",
                    "TOMORROW: Orange warning for next-day follow-ups", 
                    "X DAYS: Blue informational for future follow-ups"
                },
                Configuration = new
                {
                    ReminderDaysBefore = "Configurable via appsettings.json (SurgeryDischargeReminder:ReminderDaysBefore)",
                    BookingUrl = "Configurable via appsettings.json (SurgeryDischargeReminder:BookingUrl)",
                    DefaultSchedule = "Daily at 6:00 AM (configurable via Program.cs)"
                }
            };

            return Ok(info);
        }
    }
}
