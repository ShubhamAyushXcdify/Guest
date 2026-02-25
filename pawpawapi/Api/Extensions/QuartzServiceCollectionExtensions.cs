using Api.Jobs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;

namespace Api.Extensions
{
    public static class QuartzServiceCollectionExtensions
    {
        public static IServiceCollection AddQuartzJobs(this IServiceCollection services, IConfiguration configuration)
        {
            var vaccinationReminderSchedule = configuration["VaccinationReminder:CronSchedule"] ?? "0 0 9 * * ?";
            var vaccinationReminderDescription = configuration["VaccinationReminder:Description"] ?? "Vaccination reminder email trigger";

            var dewormingReminderSchedule = configuration["DewormingReminder:CronSchedule"] ?? "0 0 9 * * ?";
            var dewormingReminderDescription = configuration["DewormingReminder:Description"] ?? "Deworming reminder email trigger";

            var emergencyDischargeReminderSchedule = configuration["EmergencyDischargeReminder:CronSchedule"] ?? "0 0 9 * * ?";
            var emergencyDischargeReminderDescription = configuration["EmergencyDischargeReminder:Description"] ?? "Emergency discharge reminder email trigger";

            var surgeryDischargeReminderSchedule = configuration["SurgeryDischargeReminder:CronSchedule"] ?? "0 0 6 * * ?";
            var surgeryDischargeReminderDescription = configuration["SurgeryDischargeReminder:Description"] ?? "Surgery discharge reminder email trigger";

            services.AddQuartz(q =>
            {
                // Create a unique key for the vaccination reminder job
                var vaccinationJobKey = new JobKey("VaccinationReminderJob");
                
                // Register the vaccination reminder job with DI
                q.AddJob<VaccinationReminderJob>(opts => opts.WithIdentity(vaccinationJobKey));

                // Configure the trigger with cron schedule from appsettings.json
                q.AddTrigger(opts => opts
                    .ForJob(vaccinationJobKey)
                    .WithIdentity("VaccinationReminderJob-trigger")
                    .WithCronSchedule(vaccinationReminderSchedule)
                    .WithDescription(vaccinationReminderDescription));
                
                // Create a unique key for the deworming reminder job
                var dewormingJobKey = new JobKey("DewormingReminderJob");
                
                // Register the deworming reminder job with DI
                q.AddJob<DewormingReminderJob>(opts => opts.WithIdentity(dewormingJobKey));

                // Configure the trigger with cron schedule from appsettings.json
                q.AddTrigger(opts => opts
                    .ForJob(dewormingJobKey)
                    .WithIdentity("DewormingReminderJob-trigger")
                    .WithCronSchedule(dewormingReminderSchedule)
                    .WithDescription(dewormingReminderDescription));
                
                // Create a unique key for the emergency discharge reminder job
                var emergencyDischargeJobKey = new JobKey("EmergencyDischargeReminderJob");
                
                // Register the emergency discharge reminder job with DI
                q.AddJob<EmergencyDischargeReminderJob>(opts => opts.WithIdentity(emergencyDischargeJobKey));

                // Configure the trigger with cron schedule from appsettings.json
                q.AddTrigger(opts => opts
                    .ForJob(emergencyDischargeJobKey)
                    .WithIdentity("EmergencyDischargeReminderJob-trigger")
                    .WithCronSchedule(emergencyDischargeReminderSchedule)
                    .WithDescription(emergencyDischargeReminderDescription));
                
                // Create a unique key for the surgery discharge reminder job
                var surgeryDischargeJobKey = new JobKey("SurgeryDischargeReminderJob");
                
                // Register the surgery discharge reminder job with DI
                q.AddJob<SurgeryDischargeReminderJob>(opts => opts.WithIdentity(surgeryDischargeJobKey));

                // Configure the trigger with cron schedule from appsettings.json
                q.AddTrigger(opts => opts
                    .ForJob(surgeryDischargeJobKey)
                    .WithIdentity("SurgeryDischargeReminderJob-trigger")
                    .WithCronSchedule(surgeryDischargeReminderSchedule)
                    .WithDescription(surgeryDischargeReminderDescription));
            });

            // Add Quartz hosted service
            services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

            return services;
        }
    }
}
