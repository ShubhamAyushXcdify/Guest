using Core.Models;
using Dapper;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class PlanSeeder
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<PlanSeeder> _logger;

        public PlanSeeder(DapperDbContext dbContext, ILogger<PlanSeeder> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            try
            {
                using var conn = _dbContext.GetConnection();

                const string createTableSql = @"
                    CREATE TABLE IF NOT EXISTS plans (
                        id UUID PRIMARY KEY,
                        name TEXT NOT NULL,
                        notes TEXT,
                        created_at TIMESTAMPTZ DEFAULT now(),
                        updated_at TIMESTAMPTZ DEFAULT now()
                    );
                ";

                await conn.ExecuteAsync(createTableSql);

                // Common treatment plans
                var plans = new[]
                {
                    new { Id = Guid.NewGuid(), Name = "Rest & Observation", Notes = "Monitor at home with minimal activity" },
                    new { Id = Guid.NewGuid(), Name = "Diet Modification", Notes = "Change or restrict food for recovery" },
                    new { Id = Guid.NewGuid(), Name = "Medication Course", Notes = "Prescribed antibiotics, anti-inflammatories, or supplements" },
                    new { Id = Guid.NewGuid(), Name = "Wound Care", Notes = "Cleaning, dressing, and home care instructions" },
                    new { Id = Guid.NewGuid(), Name = "Vaccination Schedule", Notes = "Plan and schedule for upcoming immunizations" },
                    new { Id = Guid.NewGuid(), Name = "Parasite Control", Notes = "Deworming, flea/tick prevention measures" },
                    new { Id = Guid.NewGuid(), Name = "Physical Therapy", Notes = "Exercise plan for mobility recovery" },
                    new { Id = Guid.NewGuid(), Name = "Lab Test", Notes = "Blood work or imaging tests for diagnosis" },
                    new { Id = Guid.NewGuid(), Name = "Dental Care Plan", Notes = "Cleaning, extractions, or follow-up dental treatments" },
                    new { Id = Guid.NewGuid(), Name = "Surgery Preparation", Notes = "Pre-surgical instructions and preparation guidelines" },
                    new { Id = Guid.NewGuid(), Name = "Post-Surgery Care", Notes = "Recovery instructions and wound monitoring after surgery" },
                    new { Id = Guid.NewGuid(), Name = "Emergency Follow-up", Notes = "Scheduled check-up after emergency treatment" },
                    new { Id = Guid.NewGuid(), Name = "Chronic Disease Management", Notes = "Long-term care plan for ongoing conditions" },
                    new { Id = Guid.NewGuid(), Name = "Weight Management", Notes = "Diet and exercise plan for weight control" },
                    new { Id = Guid.NewGuid(), Name = "Behavioral Training", Notes = "Training recommendations for behavioral issues" },
                    new { Id = Guid.NewGuid(), Name = "Nutritional Supplement", Notes = "Vitamin or mineral supplements as prescribed" },
                    new { Id = Guid.NewGuid(), Name = "Grooming & Hygiene", Notes = "Regular grooming schedule and hygiene maintenance" },
                    new { Id = Guid.NewGuid(), Name = "Environmental Modification", Notes = "Changes to living environment for health improvement" },
                    new { Id = Guid.NewGuid(), Name = "Specialist Referral", Notes = "Referral to veterinary specialist for advanced care" },
                    new { Id = Guid.NewGuid(), Name = "Palliative Care", Notes = "Comfort care for end-of-life management" }
                };

                // Insert only if plan doesn't already exist (check by name)
                foreach (var plan in plans)
                {
                    var exists = await conn.ExecuteScalarAsync<int>(
                        "SELECT COUNT(1) FROM plans WHERE LOWER(name) = LOWER(@Name)",
                        new { Name = plan.Name });
                    
                    if (exists == 0)
                    {
                        await conn.ExecuteAsync(
                            "INSERT INTO plans (id, name, notes) VALUES (@Id, @Name, @Notes)",
                            new { Id = plan.Id, Name = plan.Name, Notes = plan.Notes });
                    }
                }

                _logger.LogInformation("Plan seeding completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during plan seeding.");
                throw;
            }
        }
    }
}
