using Application.Interfaces;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.Threading.Tasks;

namespace Api.Jobs
{
    /// <summary>
    /// Background job that runs on a schedule to process emergency discharge reminders
    /// </summary>
    [DisallowConcurrentExecution]
    public class EmergencyDischargeReminderJob : IJob
    {
        private readonly IEmergencyDischargeReminderService _emergencyDischargeReminderService;
        private readonly ILogger<EmergencyDischargeReminderJob> _logger;

        public EmergencyDischargeReminderJob(
            IEmergencyDischargeReminderService emergencyDischargeReminderService,
            ILogger<EmergencyDischargeReminderJob> logger)
        {
            _emergencyDischargeReminderService = emergencyDischargeReminderService;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                _logger.LogInformation("EmergencyDischargeReminderJob started at {Time}", DateTimeOffset.UtcNow);
                
                var result = await _emergencyDischargeReminderService.ProcessEmergencyDischargeRemindersAsync();
                
                if (result.Success)
                {
                    _logger.LogInformation(
                        "EmergencyDischargeReminderJob completed successfully at {Time}. Processed: {Processed}, Sent: {Sent}",
                        DateTimeOffset.UtcNow, result.TotalRemindersProcessed, result.EmailsSent);
                }
                else
                {
                    _logger.LogWarning(
                        "EmergencyDischargeReminderJob completed with errors at {Time}. Processed: {Processed}, Sent: {Sent}, Failed: {Failed}, Errors: {ErrorCount}",
                        DateTimeOffset.UtcNow, result.TotalRemindersProcessed, result.EmailsSent, result.EmailsFailed, result.Errors.Count);
                    
                    // Log each error
                    foreach (var error in result.Errors)
                    {
                        _logger.LogError("Emergency discharge reminder error: {Error}", error);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical error executing EmergencyDischargeReminderJob");
                throw;
            }
        }
    }
}
