using Core.Models;
using Dapper;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class ScreensSeeder
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ScreensSeeder> _logger;

        public ScreensSeeder(DapperDbContext dbContext, ILogger<ScreensSeeder> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            var screens = new List<(string Name, string Description)>
            {
                ("Suppliers", "Suppliers"),
                ("My Slots", "My Slots"),
                ("Dashboard", "Dashboard"),
                ("inventory", "inventory"),
                ("Clients", "Clients"),
                ("users", "users"),
                ("Rooms", "Rooms"),
                ("Patients", "Patients"),
                ("Appointments", "Appointments"),
                ("Products", "Products"),
                ("Doctors", "Doctors"),
                ("Clinics", "Clinics"),
                ("Expense Tracker", "Expense Tracker"),
                ("AI Assistant", "AI Assistant")
            };

            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                foreach (var (name, description) in screens)
                {
                    // Check if screen already exists
                    var exists = await connection.ExecuteScalarAsync<bool>(
                        "SELECT EXISTS (SELECT 1 FROM public.screens WHERE name = @Name)", new { Name = name });
                    if (!exists)
                    {
                        await connection.ExecuteAsync(
                            @"INSERT INTO public.screens (name, description) 
                              VALUES (@Name, @Description)",
                            new
                            {
                                Name = name,
                                Description = description
                            });
                    }
                }
                _logger.LogInformation("Screens seeding completed.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during screens seeding.");
                throw;
            }
        }
    }
}
