using System.Data;
using Microsoft.Extensions.Configuration;
using Npgsql;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Data
{
    public class DapperDbContext
    {
        private readonly string _connectionString;
        private readonly ILogger<DapperDbContext> _logger;

        public DapperDbContext(IConfiguration configuration, ILogger<DapperDbContext> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IDbConnection> CreateConnectionAsync()
        {
            try
            {
                var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();
                return connection;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating database connection");
                throw new InvalidOperationException("Failed to create database connection", ex);
            }
        }

        public IDbConnection GetConnection()
        {
            try
            {
                var connection = new NpgsqlConnection(_connectionString);
                connection.Open();
                return connection;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating database connection");
                throw new InvalidOperationException("Failed to create database connection", ex);
            }
        }
    }
} 