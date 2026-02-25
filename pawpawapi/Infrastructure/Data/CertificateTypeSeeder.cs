using Core.Models;
using Dapper;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class CertificateTypeSeeder
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<CertificateTypeSeeder> _logger;

        public CertificateTypeSeeder(DapperDbContext dbContext, ILogger<CertificateTypeSeeder> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            var certificateTypes = new List<(string Name, string Description)>
            {
                ("Consent Bond Certificate", "Certificate for consent and bond agreement"),
                ("Deworming Certificate", "Certificate for deworming treatment"),
                ("Euthanasia Certificate", "Certificate for euthanasia procedure"),
                ("Fitness Travel Certificate", "Certificate for fitness to travel"),
                ("Health Hostel Certificate", "Certificate for health hostel admission"),
                ("Tick Medicine Certificate", "Certificate for tick medicine treatment"),
                ("Vaccination Certificate", "Certificate for vaccination records")
            };

            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                foreach (var (name, description) in certificateTypes)
                {
                    // Check if certificate type already exists
                    var exists = await connection.ExecuteScalarAsync<bool>(
                        "SELECT EXISTS (SELECT 1 FROM certificate_type WHERE name = @Name)", new { Name = name });
                    if (!exists)
                    {
                        var now = DateTimeOffset.UtcNow;

                        await connection.ExecuteAsync(
                            @"INSERT INTO certificate_type (id, name, description, is_active, created_at, updated_at) 
                              VALUES (@Id, @Name, @Description, @IsActive, @CreatedAt, @UpdatedAt)",
                            new
                            {
                                Id = Guid.NewGuid(),
                                Name = name,
                                Description = description,
                                IsActive = true,
                                CreatedAt = now,
                                UpdatedAt = now
                            });
                    }
                }
                _logger.LogInformation("CertificateType seeding completed.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during certificate type seeding.");
                throw;
            }
        }
    }
}

