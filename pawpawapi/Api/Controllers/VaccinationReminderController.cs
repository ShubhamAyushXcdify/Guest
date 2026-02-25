using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VaccinationReminderController : ControllerBase
    {
        private readonly IVaccinationReminderService _reminderService;
        private readonly ILogger<VaccinationReminderController> _logger;

        public VaccinationReminderController(
            IVaccinationReminderService reminderService,
            ILogger<VaccinationReminderController> logger)
        {
            _reminderService = reminderService;
            _logger = logger;
        }

        /// <summary>
        /// Manually triggers the vaccination reminder email process
        /// </summary>
        /// <returns>Result of the vaccination reminder process</returns>
        [HttpPost("trigger")]
        [Authorize]
        [ProducesResponseType(typeof(ReminderResponseDto), 200)]
        [ProducesResponseType(typeof(ReminderResponseDto), 207)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> TriggerVaccinationReminders()
        {
            try
            {
                _logger.LogInformation("Manual vaccination reminder trigger requested at {Time}", DateTimeOffset.UtcNow);

                var result = await _reminderService.ProcessVaccinationRemindersAsync();

                _logger.LogInformation("Trigger completed. Success: {Success}, Sent: {Sent}, Failed: {Failed}", 
                    result.Success, result.EmailsSent, result.EmailsFailed);

                var statusCode = result.Success ? 200 : result.EmailsSent > 0 ? 207 : 500;
                return StatusCode(statusCode, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical error during vaccination reminder trigger");
                return StatusCode(500, new { error = ex.Message, success = false });
            }
        }

        /// <summary>
        /// Gets the current vaccination reminder configuration
        /// </summary>
        [HttpGet("config")]
        [Authorize]
        [ProducesResponseType(200)]
        public IActionResult GetConfiguration([FromServices] IConfiguration configuration)
        {
            var reminderDaysStr = configuration["VaccinationReminder:ReminderDaysBefore"];
            
            return Ok(new
            {
                cronSchedule = configuration["VaccinationReminder:CronSchedule"] ?? "Not configured",
                description = configuration["VaccinationReminder:Description"] ?? "Not configured",
                reminderDaysBefore = int.TryParse(reminderDaysStr, out int days) ? days : 2,
                manualTriggerEndpoint = "/api/VaccinationReminder/trigger"
            });
        }
    }
}

