using Application.Interfaces;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.Threading.Tasks;

namespace Api.Jobs
{
    /// <summary>
    /// Background job that runs on a schedule to process deworming reminders
    /// </summary>
    [DisallowConcurrentExecution]
    public class DewormingReminderJob : IJob
    {
        private readonly IDewormingReminderService _dewormingReminderService;
        private readonly ILogger<DewormingReminderJob> _logger;

        public DewormingReminderJob(
            IDewormingReminderService dewormingReminderService,
            ILogger<DewormingReminderJob> logger)
        {
            _dewormingReminderService = dewormingReminderService;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                _logger.LogInformation("DewormingReminderJob started at {Time}", DateTimeOffset.UtcNow);
                
                var result = await _dewormingReminderService.ProcessDewormingRemindersAsync();
                
                if (result.Success)
                {
                    _logger.LogInformation(
                        "DewormingReminderJob completed successfully at {Time}. Processed: {Processed}, Sent: {Sent}",
                        DateTimeOffset.UtcNow, result.TotalRemindersProcessed, result.EmailsSent);
                }
                else
                {
                    _logger.LogWarning(
                        "DewormingReminderJob completed with errors at {Time}. Processed: {Processed}, Sent: {Sent}, Failed: {Failed}, Errors: {ErrorCount}",
                        DateTimeOffset.UtcNow, result.TotalRemindersProcessed, result.EmailsSent, result.EmailsFailed, result.Errors.Count);
                    
                    // Log each error
                    foreach (var error in result.Errors)
                    {
                        _logger.LogError("Deworming reminder error: {Error}", error);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical error executing DewormingReminderJob");
                throw;
            }
        }
    }
}

