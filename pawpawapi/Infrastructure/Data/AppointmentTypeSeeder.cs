using Core.Models;
using Dapper;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class AppointmentTypeSeeder
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<AppointmentTypeSeeder> _logger;

        public AppointmentTypeSeeder(DapperDbContext dbContext, ILogger<AppointmentTypeSeeder> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            var appointmentTypes = new List<(string Name, string Description)>
            {
                ("Consultation", "General health check, symptoms, or advice."),
                ("Vaccination", "Routine or scheduled vaccines."),
                ("Deworming", "Internal parasite treatment."),
                ("Surgery", "Any planned surgical procedure."),
                ("Emergency", "Urgent care for critical issues."),
                ("Certification", "Health certification for travel, breeding, or other official purposes.")
            };

            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                foreach (var (name, description) in appointmentTypes)
                {
                    // Check if appointment type already exists
                    var exists = await connection.ExecuteScalarAsync<bool>(
                        "SELECT EXISTS (SELECT 1 FROM appointment_type WHERE name = @Name)", new { Name = name });
                    if (!exists)
                    {
                        await connection.ExecuteAsync(
                            @"INSERT INTO appointment_type (appointment_type_id, name, is_active) VALUES (@Id, @Name, @IsActive)",
                            new
                            {
                                Id = Guid.NewGuid(),
                                Name = name,
                                IsActive = true
                            });
                    }
                }
                _logger.LogInformation("AppointmentType seeding completed.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during appointment type seeding.");
                throw;
            }
        }
    }
} 