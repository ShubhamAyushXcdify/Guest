using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    /// <summary>
    /// Controller for deworming reminder operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class DewormingReminderController : ControllerBase
    {
        private readonly IDewormingReminderService _reminderService;
        private readonly ILogger<DewormingReminderController> _logger;

        public DewormingReminderController(
            IDewormingReminderService reminderService,
            ILogger<DewormingReminderController> logger)
        {
            _reminderService = reminderService;
            _logger = logger;
        }

        /// <summary>
        /// Manually triggers the deworming reminder email process
        /// </summary>
        /// <returns>Result of the deworming reminder process</returns>
        [HttpPost("trigger")]
        [Authorize]
        [ProducesResponseType(typeof(ReminderResponseDto), 200)]
        [ProducesResponseType(typeof(ReminderResponseDto), 207)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> TriggerDewormingReminders()
        {
            try
            {
                _logger.LogInformation("Manual deworming reminder trigger requested at {Time}", DateTimeOffset.UtcNow);

                var result = await _reminderService.ProcessDewormingRemindersAsync();

                _logger.LogInformation("Trigger completed. Success: {Success}, Sent: {Sent}, Failed: {Failed}", 
                    result.Success, result.EmailsSent, result.EmailsFailed);

                var statusCode = result.Success ? 200 : result.EmailsSent > 0 ? 207 : 500;
                return StatusCode(statusCode, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical error during deworming reminder trigger");
                return StatusCode(500, new { error = ex.Message, success = false });
            }
        }

        /// <summary>
        /// Gets the current deworming reminder configuration
        /// </summary>
        [HttpGet("config")]
        [Authorize]
        [ProducesResponseType(200)]
        public IActionResult GetConfiguration([FromServices] IConfiguration configuration)
        {
            var reminderDaysStr = configuration["DewormingReminder:ReminderDaysBefore"];
            
            return Ok(new
            {
                cronSchedule = configuration["DewormingReminder:CronSchedule"] ?? "Not configured",
                description = configuration["DewormingReminder:Description"] ?? "Not configured",
                reminderDaysBefore = int.TryParse(reminderDaysStr, out int days) ? days : 2,
                manualTriggerEndpoint = "/api/DewormingReminder/trigger"
            });
        }
    }
}

