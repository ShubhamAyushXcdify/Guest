using Application.Interfaces;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.Threading.Tasks;

namespace Api.Jobs
{
    /// <summary>
    /// Background job that runs on a schedule to process surgery discharge reminders
    /// </summary>
    [DisallowConcurrentExecution]
    public class SurgeryDischargeReminderJob : IJob
    {
        private readonly ISurgeryDischargeReminderService _surgeryDischargeReminderService;
        private readonly ILogger<SurgeryDischargeReminderJob> _logger;

        public SurgeryDischargeReminderJob(
            ISurgeryDischargeReminderService surgeryDischargeReminderService,
            ILogger<SurgeryDischargeReminderJob> logger)
        {
            _surgeryDischargeReminderService = surgeryDischargeReminderService;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                _logger.LogInformation("SurgeryDischargeReminderJob started at {Time}", DateTimeOffset.UtcNow);
                
                var result = await _surgeryDischargeReminderService.ProcessSurgeryDischargeRemindersAsync();
                
                if (result.Success)
                {
                    _logger.LogInformation(
                        "SurgeryDischargeReminderJob completed successfully at {Time}. Processed: {Processed}, Sent: {Sent}",
                        DateTimeOffset.UtcNow, result.TotalRemindersProcessed, result.EmailsSent);
                }
                else
                {
                    _logger.LogWarning(
                        "SurgeryDischargeReminderJob completed with errors at {Time}. Processed: {Processed}, Sent: {Sent}, Failed: {Failed}, Errors: {ErrorCount}",
                        DateTimeOffset.UtcNow, result.TotalRemindersProcessed, result.EmailsSent, result.EmailsFailed, result.Errors.Count);
                    
                    // Log each error
                    foreach (var error in result.Errors)
                    {
                        _logger.LogError("Surgery discharge reminder error: {Error}", error);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical error executing SurgeryDischargeReminderJob");
                throw;
            }
        }
    }
}
