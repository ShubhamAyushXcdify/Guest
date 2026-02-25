using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class RoomRepository : IRoomRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<RoomRepository> _logger;

        public RoomRepository(DapperDbContext dbContext, ILogger<RoomRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger;
        }

        public async Task<Room?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = "SELECT * FROM rooms WHERE id = @Id";
                return await connection.QueryFirstOrDefaultAsync<Room>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetByIdAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<(IEnumerable<Room> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            Guid? clinicId = null,
            bool paginationRequired = true)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (clinicId.HasValue)
                {
                    whereClauses.Add("clinic_id = @ClinicId");
                    parameters.Add("ClinicId", clinicId.Value);
                }

                var whereClause = whereClauses.Count > 0 
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                var countSql = $"SELECT COUNT(*) FROM rooms {whereClause}";
                var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

                var sql = $"SELECT * FROM rooms {whereClause} ORDER BY created_at DESC";

                if (paginationRequired)
                {
                    var offset = (pageNumber - 1) * pageSize;
                    sql += " LIMIT @PageSize OFFSET @Offset";
                    parameters.Add("PageSize", pageSize);
                    parameters.Add("Offset", offset);
                }

                var items = await connection.QueryAsync<Room>(sql, parameters);
                return (items, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<Room> AddAsync(Room room)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                // Generate new ID if not provided
                if (room.Id == Guid.Empty)
                {
                    room.Id = Guid.NewGuid();
                }

                // Set timestamps
                room.CreatedAt = DateTimeOffset.UtcNow;

                const string sql = @"
                    INSERT INTO rooms (
                        id, clinic_id, name, room_type, is_active, created_at
                    ) VALUES (
                        @Id, @ClinicId, @Name, @RoomType, @IsActive, @CreatedAt
                    )
                    RETURNING *;";
                
                return await connection.QuerySingleAsync<Room>(sql, room);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddAsync: {ex.Message}");
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        public async Task<Room> UpdateAsync(Room room)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                // Get existing room to compare values
                var existingRoom = await GetByIdAsync(room.Id);
                if (existingRoom == null)
                    throw new KeyNotFoundException("Room not found.");

                // Build dynamic update query based on changed values
                var setClauses = new List<string>();
                var parameters = new DynamicParameters();
                parameters.Add("Id", room.Id);

                // Only include fields that have changed
                if (room.ClinicId != existingRoom.ClinicId)
                {
                    setClauses.Add("clinic_id = @ClinicId");
                    parameters.Add("ClinicId", room.ClinicId);
                }
                if (room.Name != existingRoom.Name)
                {
                    setClauses.Add("name = @Name");
                    parameters.Add("Name", room.Name);
                }
                if (room.RoomType != existingRoom.RoomType)
                {
                    setClauses.Add("room_type = @RoomType");
                    parameters.Add("RoomType", room.RoomType);
                }
                if (room.IsActive != existingRoom.IsActive)
                {
                    setClauses.Add("is_active = @IsActive");
                    parameters.Add("IsActive", room.IsActive);
                }

                if (setClauses.Count == 0) // No changes
                {
                    return existingRoom;
                }

                var setClause = string.Join(", ", setClauses);
                var sql = $"UPDATE rooms SET {setClause} WHERE id = @Id RETURNING *;";

                var result = await connection.QuerySingleOrDefaultAsync<Room>(sql, parameters);
                if (result == null)
                    throw new KeyNotFoundException("Room not found.");

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = "DELETE FROM rooms WHERE id = @Id";
                var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<IEnumerable<Room>> GetByClinicIdAsync(Guid clinicId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = "SELECT * FROM rooms WHERE clinic_id = @ClinicId";
                return await connection.QueryAsync<Room>(sql, new { ClinicId = clinicId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetByClinicIdAsync: {ex.Message}");
                throw;
            }
        }
    }
} 