using Infrastructure.Data;
using Microsoft.AspNetCore.Builder;

namespace Api.Extensions
{
    public static class SeederApplicationBuilderExtensions
    {
        public static async Task RunSeedersAsync(this WebApplication app)
        {
            // Seed doctor slots at startup
            using (var scope = app.Services.CreateScope())
            {
                var doctorSlotSeeder = scope.ServiceProvider.GetRequiredService<DoctorSlotSeeder>();
                await doctorSlotSeeder.SeedAsync();
            }

            using (var scope = app.Services.CreateScope())
            {
                var seeder = scope.ServiceProvider.GetRequiredService<AppointmentTypeSeeder>();
                await seeder.SeedAsync();
            }

            using (var scope = app.Services.CreateScope())
            {
                var seeder = scope.ServiceProvider.GetRequiredService<ProcedureSeeder>();
                await seeder.SeedAsync();
            }

            using (var scope = app.Services.CreateScope())
            {
                var seeder = scope.ServiceProvider.GetRequiredService<SymptomSeeder>();
                await seeder.SeedAsync();
            }

            using (var scope = app.Services.CreateScope())
            {
                var seeder = scope.ServiceProvider.GetRequiredService<VaccinationMasterSeeder>();
                await seeder.SeedAsync();
            }

            using (var scope = app.Services.CreateScope())
            {
                var seeder = scope.ServiceProvider.GetRequiredService<ScreensSeeder>();
                await seeder.SeedAsync();
            }

            using (var scope = app.Services.CreateScope())
            {
                var seeder = scope.ServiceProvider.GetRequiredService<CertificateTypeSeeder>();
                await seeder.SeedAsync();
            }

            using (var scope = app.Services.CreateScope())
            {
                var seeder = scope.ServiceProvider.GetRequiredService<PlanSeeder>();
                await seeder.SeedAsync();
            }

            // UserSeeder runs after authentication/authorization setup
            using (var scope = app.Services.CreateScope())
            {
                var seeder = scope.ServiceProvider.GetRequiredService<UserSeeder>();
                await seeder.SeedAsync();
            }
        }
    }
}
