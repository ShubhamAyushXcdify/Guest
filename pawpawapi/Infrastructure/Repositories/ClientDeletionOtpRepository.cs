using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;
using System;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class ClientDeletionOtpRepository : IClientDeletionOtpRepository
    {
        private readonly DapperDbContext _dbContext;

        public ClientDeletionOtpRepository(DapperDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task CreateAsync(Guid clientId, string otp, DateTime expiresAt)
        {
            const string sql = @"
                INSERT INTO client_deletion_otps (client_id, otp, expires_at)
                VALUES (@ClientId, @Otp, @ExpiresAt);";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, new { ClientId = clientId, Otp = otp, ExpiresAt = expiresAt });
        }

        public async Task<ClientDeletionOtp?> GetValidOtpAsync(Guid clientId, string otp)
        {
            const string sql = @"
                SELECT * FROM client_deletion_otps
                WHERE client_id = @ClientId
                  AND otp = @Otp
                  AND is_used = false
                  AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1;";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<ClientDeletionOtp>(sql, new { ClientId = clientId, Otp = otp });
        }

        public async Task MarkAsUsedAsync(Guid id)
        {
            const string sql = @"
                UPDATE client_deletion_otps
                SET is_used = true
                WHERE id = @Id;";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, new { Id = id });
        }
    }
}
