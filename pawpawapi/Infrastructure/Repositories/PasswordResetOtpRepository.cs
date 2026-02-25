using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;
using System;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class PasswordResetOtpRepository : IPasswordResetOtpRepository
    {
        private readonly DapperDbContext _dbContext;

        public PasswordResetOtpRepository(DapperDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task CreateAsync(string email, string otp, DateTime expiresAt)
        {
            const string sql = @"
                INSERT INTO password_reset_otps (email, otp, expires_at)
                VALUES (@Email, @Otp, @ExpiresAt);";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, new { Email = email, Otp = otp, ExpiresAt = expiresAt });
        }

        public async Task<PasswordResetOtp?> GetValidOtpAsync(string email, string otp)
        {
            const string sql = @"
                SELECT * FROM password_reset_otps
                WHERE email = @Email
                  AND otp = @Otp
                  AND is_used = false
                  AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1;";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<PasswordResetOtp>(sql, new { Email = email, Otp = otp });
        }

        public async Task MarkAsUsedAsync(Guid id)
        {
            const string sql = @"
                UPDATE password_reset_otps
                SET is_used = true
                WHERE id = @Id;";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, new { Id = id });
        }
    }
}