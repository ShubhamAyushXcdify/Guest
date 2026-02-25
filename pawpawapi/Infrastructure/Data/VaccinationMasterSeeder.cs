using Core.Models;
using Dapper;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class VaccinationMasterSeeder
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<VaccinationMasterSeeder> _logger;

        public VaccinationMasterSeeder(DapperDbContext dbContext, ILogger<VaccinationMasterSeeder> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            using var connection = _dbContext.GetConnection();
            // Create table if not exists
            const string createTableSql = @"
            CREATE TABLE IF NOT EXISTS vaccination_master (
                id UUID PRIMARY KEY,
                species VARCHAR(32) NOT NULL,
                disease VARCHAR(128) NOT NULL,
                vaccine_type VARCHAR(128) NOT NULL,
                initial_dose VARCHAR(64) NOT NULL,
                booster VARCHAR(128) NOT NULL,
                revaccination_interval VARCHAR(128) NOT NULL,
                notes TEXT,
                vac_code VARCHAR(64),
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL
            );";
            await connection.ExecuteAsync(createTableSql);

            var now = DateTimeOffset.UtcNow;
            var vaccines = new List<VaccinationMaster>
            {
                // Cats
                new VaccinationMaster {Id = Guid.NewGuid(), Species = "cat", Disease = "Nobivac Tricat Trio", VaccineType = "Live attenuated", InitialDose = "Annual vaccine per year", Booster = "Annual dose per year", RevaccinationInterval = "", Notes = "", VacCode = "catNobivacTricatTrio", CreatedAt = now, UpdatedAt = now },
                new VaccinationMaster {Id = Guid.NewGuid(), Species = "cat", Disease = "Nobivac Tricat Trio+Nobivac Rabies", VaccineType = "Live attenuated + Inactivated", InitialDose = "", Booster = "", RevaccinationInterval = "", Notes = "", VacCode = "catNobivacTricatTrioRabies", CreatedAt = now, UpdatedAt = now },
                // Dogs
                new VaccinationMaster {Id = Guid.NewGuid(), Species = "dog", Disease = "Nobivac KC", VaccineType = "Live attenuated", InitialDose = "3 weeks", Booster = "", RevaccinationInterval = "Annual vaccine per year", Notes = "", VacCode = "dogNobivacKC", CreatedAt = now, UpdatedAt = now },
                new VaccinationMaster {Id = Guid.NewGuid(),Species = "dog", Disease = "Nobivac Puppy DP", VaccineType = "Live attenuated", InitialDose = "4-6 weeks", Booster = "", RevaccinationInterval = "Annual dose per year", Notes = "", VacCode = "dogNobivacPuppyDP", CreatedAt = now, UpdatedAt = now },
                new VaccinationMaster {Id = Guid.NewGuid(),Species = "dog", Disease = "Nobivac DHPPi+L4/Lepto", VaccineType = "Live attenuated", InitialDose = "8-9 weeks", Booster = "", RevaccinationInterval = "", Notes = "", VacCode = "dogNobivacDHPPiLepto", CreatedAt = now, UpdatedAt = now },
                new VaccinationMaster {Id = Guid.NewGuid(),Species = "dog", Disease = "Nobivac DHPPi+RL", VaccineType = "Live attenuated", InitialDose = "12 weeks", Booster = "", RevaccinationInterval = "", Notes = "", VacCode = "dogNobivacDHPPiRL", CreatedAt = now, UpdatedAt = now },
                // Rabbit
                new VaccinationMaster {Id = Guid.NewGuid(), Species = "rabbit", Disease = "NOBIVAC RABIES", VaccineType = "Inactivated", InitialDose = "", Booster = "", RevaccinationInterval = "Annual vaccine per year", Notes = "", VacCode = "rabRabies", CreatedAt = now, UpdatedAt = now },
                // Turtle
                new VaccinationMaster {Id = Guid.NewGuid(), Species = "turtle", Disease = "NOBIVAC RABIES", VaccineType = "Inactivated", InitialDose = "", Booster = "", RevaccinationInterval = "Annual vaccine per year", Notes = "", VacCode = "turRabies", CreatedAt = now, UpdatedAt = now },
                // Bird
                new VaccinationMaster {Id = Guid.NewGuid(), Species = "bird", Disease = "NOBIVAC RABIES", VaccineType = "Inactivated", InitialDose = "", Booster = "", RevaccinationInterval = "Annual vaccine per year", Notes = "", VacCode = "birdRabies", CreatedAt = now, UpdatedAt = now },
                // Fish
                new VaccinationMaster {Id = Guid.NewGuid(), Species = "fish", Disease = "NOBIVAC RABIES", VaccineType = "Inactivated", InitialDose = "", Booster = "", RevaccinationInterval = "Annual vaccine per year", Notes = "", VacCode = "fishRabies", CreatedAt = now, UpdatedAt = now },
                // Hamster
                new VaccinationMaster {Id = Guid.NewGuid(), Species = "hamster", Disease = "NOBIVAC RABIES", VaccineType = "Inactivated", InitialDose = "", Booster = "", RevaccinationInterval = "Annual vaccine per year", Notes = "", VacCode = "hamRabies", CreatedAt = now, UpdatedAt = now },
                // Guinea Pig
                new VaccinationMaster {Id = Guid.NewGuid(), Species = "guneia_pig", Disease = "NOBIVAC RABIES", VaccineType = "Inactivated", InitialDose = "", Booster = "", RevaccinationInterval = "Annual vaccine per year", Notes = "", VacCode = "guineaPigRabies", CreatedAt = now, UpdatedAt = now },
            };

            foreach (var vaccine in vaccines)
            {
                var exists = await connection.ExecuteScalarAsync<int>(
                    "SELECT COUNT(1) FROM vaccination_master WHERE species = @Species AND disease = @Disease",
                    new { vaccine.Species, vaccine.Disease });
                if (exists == 0)
                {
                    await connection.ExecuteAsync(
                        "INSERT INTO vaccination_master (id, species, disease, vaccine_type, initial_dose, booster, revaccination_interval, notes, vac_code, created_at, updated_at) VALUES (@Id, @Species, @Disease, @VaccineType, @InitialDose, @Booster, @RevaccinationInterval, @Notes, @VacCode, @CreatedAt, @UpdatedAt)",
                        vaccine);
                }
            }
            _logger.LogInformation("Vaccination master seeding completed.");
        }
    }
} 