using Application.Interfaces;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.Threading.Tasks;

namespace Api.Jobs
{
    /// <summary>
    /// Background job that runs on a schedule to process vaccination reminders
    /// </summary>
    [DisallowConcurrentExecution]
    public class VaccinationReminderJob : IJob
    {
        private readonly IVaccinationReminderService _vaccinationReminderService;
        private readonly ILogger<VaccinationReminderJob> _logger;

        public VaccinationReminderJob(
            IVaccinationReminderService vaccinationReminderService,
            ILogger<VaccinationReminderJob> logger)
        {
            _vaccinationReminderService = vaccinationReminderService;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                _logger.LogInformation("VaccinationReminderJob started at {Time}", DateTimeOffset.UtcNow);
                
                var result = await _vaccinationReminderService.ProcessVaccinationRemindersAsync();
                
                if (result.Success)
                {
                    _logger.LogInformation(
                        "VaccinationReminderJob completed successfully at {Time}. Processed: {Processed}, Sent: {Sent}",
                        DateTimeOffset.UtcNow, result.TotalRemindersProcessed, result.EmailsSent);
                }
                else
                {
                    _logger.LogWarning(
                        "VaccinationReminderJob completed with errors at {Time}. Processed: {Processed}, Sent: {Sent}, Failed: {Failed}, Errors: {ErrorCount}",
                        DateTimeOffset.UtcNow, result.TotalRemindersProcessed, result.EmailsSent, result.EmailsFailed, result.Errors.Count);
                    
                    // Log each error
                    foreach (var error in result.Errors)
                    {
                        _logger.LogError("Vaccination reminder error: {Error}", error);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical error executing VaccinationReminderJob");
                throw;
            }
        }
    }
}

