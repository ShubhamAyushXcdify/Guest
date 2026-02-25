using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;

namespace Infrastructure.Repositories
{
    public class UserClinicRepository : IUserClinicRepository
    {
        private readonly DapperDbContext _dbContext;

        public UserClinicRepository(DapperDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<UserClinic?> GetByIdAsync(Guid id)
        {
            const string sql = "SELECT * FROM user_clinics WHERE id = @Id AND is_active = true";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<UserClinic>(sql, new { Id = id });
        }

        public async Task<(IEnumerable<UserClinic> Items, int TotalCount)> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid? clinicId = null)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                
                var whereConditions = new List<string> { "is_active = true" };
                if (clinicId.HasValue) whereConditions.Add("clinic_id = @ClinicId");
                var whereClause = "WHERE " + string.Join(" AND ", whereConditions);
                var offset = (pageNumber - 1) * pageSize;
                
                var countSql = $"SELECT COUNT(*) FROM user_clinics {whereClause}";
                var totalCount = await connection.ExecuteScalarAsync<int>(countSql, new { ClinicId = clinicId });
                
                var sql = $@"
                    SELECT * FROM user_clinics 
                    {whereClause}
                    ORDER BY created_at DESC
                    LIMIT @PageSize OFFSET @Offset";
                
                var parameters = new { 
                    ClinicId = clinicId,
                    PageSize = pageSize,
                    Offset = offset
                };
                
                var items = await connection.QueryAsync<UserClinic>(sql, parameters);
                return (items, totalCount);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<UserClinic> AddAsync(UserClinic userClinic)
        {
            const string sql = @"
                INSERT INTO user_clinics (id, user_id, clinic_id, is_primary, is_active, created_at)
                VALUES (@Id, @UserId, @ClinicId, @IsPrimary, @IsActive, @CreatedAt)
                RETURNING *;";
            using var connection = _dbContext.GetConnection();
            return await connection.QuerySingleAsync<UserClinic>(sql, userClinic);
        }

        public async Task<UserClinic> UpdateAsync(UserClinic userClinic)
        {
            const string sql = @"
                UPDATE user_clinics SET
                    user_id = @UserId,
                    clinic_id = @ClinicId,
                    is_primary = @IsPrimary,
                    is_active = @IsActive,
                    created_at = @CreatedAt
                WHERE id = @Id AND is_active = true
                RETURNING *;";
            using var connection = _dbContext.GetConnection();
            return await connection.QuerySingleAsync<UserClinic>(sql, userClinic);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            // Soft delete: set is_active = false instead of deleting
            const string sql = "UPDATE user_clinics SET is_active = false WHERE id = @Id AND is_active = true";
            using var connection = _dbContext.GetConnection();
            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
            return rowsAffected > 0;
        }

        public async Task<IEnumerable<UserClinic>> GetByUserIdAsync(Guid userId)
        {
            const string sql = "SELECT * FROM user_clinics WHERE user_id = @UserId AND is_active = true";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<UserClinic>(sql, new { UserId = userId });
        }
    }
} 