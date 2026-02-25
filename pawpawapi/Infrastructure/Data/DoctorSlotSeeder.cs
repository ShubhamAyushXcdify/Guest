using Core.Models;
using Dapper;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class DoctorSlotSeeder
    {
        private readonly DapperDbContext _dbContext;
        public DoctorSlotSeeder(DapperDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task SeedAsync()
        {
            // Ensure the doctor_slot table exists
            using (var conn = _dbContext.GetConnection())
            {
                const string createTableSql = @"
                CREATE TABLE IF NOT EXISTS doctor_slot (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    day VARCHAR(20) NOT NULL,
                    start_time INTERVAL NOT NULL,
                    end_time INTERVAL NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN NOT NULL DEFAULT true
                )";
                await conn.ExecuteAsync(createTableSql);
            }

            // Define days and slots
            var days = new[] { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
            var slots = new (TimeSpan Start, TimeSpan End)[]
            {
                (TimeSpan.FromHours(10), TimeSpan.FromHours(11)),
                (TimeSpan.FromHours(11), TimeSpan.FromHours(12)),
                (TimeSpan.FromHours(12), TimeSpan.FromHours(13)),
                (TimeSpan.FromHours(14), TimeSpan.FromHours(15)),
                (TimeSpan.FromHours(15), TimeSpan.FromHours(16)),
                (TimeSpan.FromHours(16), TimeSpan.FromHours(17)),
                (TimeSpan.FromHours(17), TimeSpan.FromHours(18)),
            };

            var now = DateTime.UtcNow;
            var slotList = new List<DoctorSlot>();
            foreach (var day in days)
            {
                foreach (var slot in slots)
                {
                    slotList.Add(new DoctorSlot
                    {
                        Id = Guid.NewGuid(),
                        Day = day,
                        StartTime = slot.Start,
                        EndTime = slot.End,
                        CreatedAt = now,
                        UpdatedAt = now,
                        IsActive = true
                    });
                }
            }

            using (var conn = _dbContext.GetConnection())
            {
                foreach (var slot in slotList)
                {
                    var exists = await conn.ExecuteScalarAsync<int>(
                        "SELECT COUNT(1) FROM doctor_slot WHERE day = @Day AND start_time = @StartTime AND end_time = @EndTime",
                        new { slot.Day, slot.StartTime, slot.EndTime });
                    if (exists == 0)
                    {
                        const string sql = @"
                        INSERT INTO doctor_slot (id, day, start_time, end_time, created_at, updated_at, is_active)
                        VALUES (@Id, @Day, @StartTime, @EndTime, @CreatedAt, @UpdatedAt, @IsActive)";
                        await conn.ExecuteAsync(sql, slot);
                    }
                }
            }
        }
    }
} 