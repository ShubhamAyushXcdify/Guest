using Core.Models;

using Dapper;

using System;

using System.Collections.Generic;

using System.Threading.Tasks;

namespace Infrastructure.Data

{

    public class SymptomSeeder

    {

        private readonly DapperDbContext _dbContext;

        public SymptomSeeder(DapperDbContext dbContext)

        {

            _dbContext = dbContext;

        }

        public async Task SeedAsync()

        {

            using var conn = _dbContext.GetConnection();

            const string createTableSql = @"

                CREATE TABLE IF NOT EXISTS symptoms (

                    id UUID PRIMARY KEY,

                    name TEXT NOT NULL,

                    notes TEXT,

                    created_at TIMESTAMPTZ DEFAULT now(),

                    updated_at TIMESTAMPTZ DEFAULT now(),

                    iscomman BOOLEAN DEFAULT false,

                    breed TEXT

                );

            ";

            await conn.ExecuteAsync(createTableSql);

            // Clear existing data

            await conn.ExecuteAsync("DELETE FROM symptoms");

            // Common symptoms (applicable to all breeds)

            var commonSymptoms = new List<dynamic>

            {

                new { Id = Guid.NewGuid(), Name = "Loss of appetite", Notes = "Refusing food or treats", IsCommon = true, Breed = (string)null },

                new { Id = Guid.NewGuid(), Name = "Lethargy", Notes = "Unusual tiredness or unwillingness to move or play", IsCommon = true, Breed = (string)null },

                new { Id = Guid.NewGuid(), Name = "Vomiting", Notes = "Especially if frequent or contains blood", IsCommon = true, Breed = (string)null },

                new { Id = Guid.NewGuid(), Name = "Diarrhea", Notes = "Persistent or bloody stools", IsCommon = true, Breed = (string)null },

                new { Id = Guid.NewGuid(), Name = "Excessive thirst", Notes = "Drinking more water than usual (polydipsia)", IsCommon = true, Breed = (string)null },

                new { Id = Guid.NewGuid(), Name = "Frequent urination", Notes = "Or difficulty urinating", IsCommon = true, Breed = (string)null },

                new { Id = Guid.NewGuid(), Name = "Weight loss", Notes = "Unexplained, even with normal eating", IsCommon = true, Breed = (string)null },

                new { Id = Guid.NewGuid(), Name = "Coughing", Notes = "Dry or productive, persistent cough", IsCommon = true, Breed = (string)null },

                new { Id = Guid.NewGuid(), Name = "Sneezing or nasal discharge", Notes = "Especially if yellow/green", IsCommon = true, Breed = (string)null },

                new { Id = Guid.NewGuid(), Name = "Other", Notes = "Other symptoms not listed", IsCommon = true, Breed = (string)null }

            };

            // Dog-specific symptoms

            var dogSymptoms = new List<dynamic>

            {

                new { Id = Guid.NewGuid(), Name = "Hip dysplasia signs", Notes = "Difficulty standing or limping", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Itchy skin (allergies)", Notes = "Scratching, licking, red skin", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Ear infections", Notes = "Shaking head, bad odor from ear", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Panting", Notes = "Excessive or unusual panting (not just due to heat or exercise)", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Itching or scratching", Notes = "Persistent, with or without skin rash", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Limping", Notes = "Favoring one leg, stiffness, or reluctance to walk", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Swelling", Notes = "Any unusual lumps or swellings", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Bad breath", Notes = "Can indicate dental disease or organ issues", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Changes in behavior", Notes = "Aggression, confusion, depression", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Shaking or tremors", Notes = "Not related to cold or fear", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Seizures", Notes = "Any uncontrolled shaking or collapse", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Disorientation or head tilt", Notes = "May indicate neurological issues", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Changes in eyes", Notes = "Redness, cloudiness, discharge, or squinting", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Excessive drooling", Notes = "Could be a sign of poisoning or dental issues", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Skin changes", Notes = "Sores, flakiness, redness, or hair loss", IsCommon = false, Breed = "dog" },

                new { Id = Guid.NewGuid(), Name = "Other", Notes = "Other symptoms not listed", IsCommon = false, Breed = "dog" }

            };

            // Cat-specific symptoms
            var catSymptoms = new List<dynamic>
            {
                new { Id = Guid.NewGuid(), Name = "Hairballs", Notes = "Frequent vomiting of hair or inability to pass hairballs", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Litter box avoidance", Notes = "Urinating or defecating outside the litter box", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Excessive grooming", Notes = "Over-grooming leading to bald patches or skin irritation", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Hiding behavior", Notes = "Unusual withdrawal or hiding for extended periods", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Changes in vocalization", Notes = "Excessive meowing, yowling, or sudden silence", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Difficulty jumping", Notes = "Reluctance to jump on furniture or difficulty landing", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Third eyelid visible", Notes = "Nictitating membrane showing (sign of illness)", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Dental issues", Notes = "Bad breath, difficulty eating, drooling", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Respiratory distress", Notes = "Open-mouth breathing, wheezing, or labored breathing", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Urinary blockage signs", Notes = "Straining to urinate, crying in litter box (emergency)", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Tail position changes", Notes = "Tail held low or tucked under body", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Purring when in pain", Notes = "Continuous purring, especially when touched", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Sudden aggression", Notes = "Uncharacteristic aggressive behavior when touched", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Changes in sleeping patterns", Notes = "Sleeping much more or much less than usual", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Eye discharge", Notes = "Watery, yellow, or green discharge from eyes", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Fur matting", Notes = "Inability to groom properly, leading to matted fur", IsCommon = false, Breed = "cat" },
                new { Id = Guid.NewGuid(), Name = "Other", Notes = "Other symptoms not listed", IsCommon = false, Breed = "cat" }
            };

            var insertSql = @"
                INSERT INTO symptoms (id, name, notes, iscomman, breed)
                VALUES (@Id, @Name, @Notes, @IsCommon, @Breed);
            ";

            await conn.ExecuteAsync(insertSql, commonSymptoms);
            await conn.ExecuteAsync(insertSql, dogSymptoms);
            await conn.ExecuteAsync(insertSql, catSymptoms);

        }

    }

}

