using Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Extensions
{
    public static class SeederServiceCollectionExtensions
    {
        public static IServiceCollection AddSeeders(this IServiceCollection services)
        {
            // Register all seeders for dependency injection
            services.AddScoped<UserSeeder>();
            services.AddScoped<SymptomSeeder>();
            services.AddScoped<DoctorSlotSeeder>();
            services.AddScoped<AppointmentTypeSeeder>();
            services.AddScoped<ProcedureSeeder>();
            services.AddScoped<VaccinationMasterSeeder>();
            services.AddScoped<ScreensSeeder>();
            services.AddScoped<CertificateTypeSeeder>();
            services.AddScoped<PlanSeeder>();

            return services;
        }
    }
}
