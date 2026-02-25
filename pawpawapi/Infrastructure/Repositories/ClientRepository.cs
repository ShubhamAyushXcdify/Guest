using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class ClientRepository : IClientRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ClientRepository> _logger;

        public ClientRepository(DapperDbContext dbContext, ILogger<ClientRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Client> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT
                        id AS Id,
                        company_id AS CompanyId,
                        first_name AS FirstName,
                        last_name AS LastName,
                        email AS Email,
                        phone_primary AS PhonePrimary,
                        phone_secondary AS PhoneSecondary,
                        address_line1 AS AddressLine1,
                        address_line2 AS AddressLine2,
                        city AS City,
                        state AS State,
                        postal_code AS PostalCode,
                        emergency_contact_name AS EmergencyContactName,
                        emergency_contact_phone AS EmergencyContactPhone,
                        notes AS Notes,
                        is_active AS IsActive,
                        is_premium AS IsPremium,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt,
                        encrypted_password AS EncryptedPassword
                    FROM clients
                    WHERE id = @Id";

                return await connection.QueryFirstOrDefaultAsync<Client>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for client {ClientId}", id);
                throw new InvalidOperationException("Failed to retrieve client.", ex);
            }
        }

        public async Task<(IEnumerable<Client> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            string? type = null,
            string? query = null,
            Guid? companyId = null,
            string? firstName = null,
            string? lastName = null,
            string? email = null,
            string? phonePrimary = null,
            string? phoneSecondary = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                // Add company filter
                if (companyId.HasValue)
                {
                    whereClauses.Add("company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                // Add dynamic column search if type and query are provided
                if (!string.IsNullOrEmpty(type) && !string.IsNullOrEmpty(query))
                {
                    // Convert the type parameter to snake_case for database column name
                    var columnName = string.Concat(type.Select((x, i) => i > 0 && char.IsUpper(x) ? "_" + x.ToString() : x.ToString())).ToLower();

                    // Validate that the column name exists in the table
                    var columnExists = await connection.QueryFirstOrDefaultAsync<bool>(
                        $"SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = @ColumnName);",
                        new { ColumnName = columnName });

                    if (columnExists)
                    {
                        whereClauses.Add($"LOWER({columnName}) LIKE LOWER(@DynamicQuery)");
                        parameters.Add("DynamicQuery", $"%{query}%");
                    }
                }

                // Add new optional filters
                if (!string.IsNullOrEmpty(firstName))
                {
                    whereClauses.Add("LOWER(first_name) LIKE LOWER(@FirstName)");
                    parameters.Add("FirstName", $"%{firstName}%");
                }
                if (!string.IsNullOrEmpty(lastName))
                {
                    whereClauses.Add("LOWER(last_name) LIKE LOWER(@LastName)");
                    parameters.Add("LastName", $"%{lastName}%");
                }
                if (!string.IsNullOrEmpty(email))
                {
                    whereClauses.Add("LOWER(email) LIKE LOWER(@Email)");
                    parameters.Add("Email", $"%{email}%");
                }
                if (!string.IsNullOrEmpty(phonePrimary))
                {
                    whereClauses.Add("LOWER(phone_primary) LIKE LOWER(@PhonePrimary)");
                    parameters.Add("PhonePrimary", $"%{phonePrimary}%");
                }
                if (!string.IsNullOrEmpty(phoneSecondary))
                {
                    whereClauses.Add("LOWER(phone_secondary) LIKE LOWER(@PhoneSecondary)");
                    parameters.Add("PhoneSecondary", $"%{phoneSecondary}%");
                }

                var whereClause = whereClauses.Count > 0 
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                // Get total count with filters
                var countQuery = $@"
SELECT COUNT(*) 
FROM clients 
{whereClause};";

                var totalCount = await connection.ExecuteScalarAsync<int>(countQuery, parameters);

                // Get paginated data with filters
                var sqlQuery = $@"
SELECT
    id AS Id,
    company_id AS CompanyId,
    first_name AS FirstName,
    last_name AS LastName,
    email AS Email,
    phone_primary AS PhonePrimary,
    phone_secondary AS PhoneSecondary,
    address_line1 AS AddressLine1,
    address_line2 AS AddressLine2,
    city AS City,
    state AS State,
    postal_code AS PostalCode,
    emergency_contact_name AS EmergencyContactName,
    emergency_contact_phone AS EmergencyContactPhone,
    notes AS Notes,
    is_active AS IsActive,
    is_premium AS IsPremium,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt
FROM clients
{whereClause}
ORDER BY created_at DESC
LIMIT @PageSize
OFFSET @Offset;";

                parameters.Add("PageSize", pageSize);
                parameters.Add("Offset", (pageNumber - 1) * pageSize);
                
                var clients = await connection.QueryAsync<Client>(sqlQuery, parameters);
                
                return (clients, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get all clients", ex);
            }
        }

        public async Task<Client> CreateAsync(Client client)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Generate new ID if not provided
                if (client.Id == Guid.Empty||client.Id==null)
                {
                    client.Id = Guid.NewGuid();
                }

                // Set timestamps
                client.CreatedAt = DateTimeOffset.UtcNow;
                client.UpdatedAt = DateTimeOffset.UtcNow;

                const string sql = @"
                    INSERT INTO clients (
                        id, company_id, first_name, last_name, email, phone_primary, phone_secondary,
                        address_line1, address_line2, city, state, postal_code,
                        emergency_contact_name, emergency_contact_phone, notes, is_active, is_premium,
                        created_at, updated_at, encrypted_password
                    ) VALUES (
                        @Id, @CompanyId, @FirstName, @LastName, @Email, @PhonePrimary, @PhoneSecondary,
                        @AddressLine1, @AddressLine2, @City, @State, @PostalCode,
                        @EmergencyContactName, @EmergencyContactPhone, @Notes, @IsActive, @IsPremium,
                        @CreatedAt, @UpdatedAt, @EncryptedPassword
                    )
                    RETURNING
                        id AS Id,
                        company_id AS CompanyId,
                        first_name AS FirstName,
                        last_name AS LastName,
                        email AS Email,
                        phone_primary AS PhonePrimary,
                        phone_secondary AS PhoneSecondary,
                        address_line1 AS AddressLine1,
                        address_line2 AS AddressLine2,
                        city AS City,
                        state AS State,
                        postal_code AS PostalCode,
                        emergency_contact_name AS EmergencyContactName,
                        emergency_contact_phone AS EmergencyContactPhone,
                        notes AS Notes,
                        is_active AS IsActive,
                        is_premium AS IsPremium,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt,
                        encrypted_password AS EncryptedPassword;";

                var createdClient = await connection.QuerySingleAsync<Client>(sql, client, transaction);
                transaction.Commit();
                return createdClient;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create client.", ex);
            }
        }

        public async Task<Client> UpdateAsync(Client client)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Set updated timestamp
                client.UpdatedAt = DateTimeOffset.UtcNow;

                const string sql = @"
                    UPDATE clients SET
                        company_id = @CompanyId,
                        first_name = @FirstName,
                        last_name = @LastName,
                        email = @Email,
                        phone_primary = @PhonePrimary,
                        phone_secondary = @PhoneSecondary,
                        address_line1 = @AddressLine1,
                        address_line2 = @AddressLine2,
                        city = @City,
                        state = @State,
                        postal_code = @PostalCode,
                        emergency_contact_name = @EmergencyContactName,
                        emergency_contact_phone = @EmergencyContactPhone,
                        notes = @Notes,
                        is_active = @IsActive,
                        is_premium = @IsPremium,
                        updated_at = @UpdatedAt
                    WHERE id = @Id
                    RETURNING
                        id AS Id,
                        company_id AS CompanyId,
                        first_name AS FirstName,
                        last_name AS LastName,
                        email AS Email,
                        phone_primary AS PhonePrimary,
                        phone_secondary AS PhoneSecondary,
                        address_line1 AS AddressLine1,
                        address_line2 AS AddressLine2,
                        city AS City,
                        state AS State,
                        postal_code AS PostalCode,
                        emergency_contact_name AS EmergencyContactName,
                        emergency_contact_phone AS EmergencyContactPhone,
                        notes AS Notes,
                        is_active AS IsActive,
                        is_premium AS IsPremium,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt,
                        encrypted_password AS EncryptedPassword;";

                var updated = await connection.QuerySingleOrDefaultAsync<Client>(sql, client, transaction);
                if (updated == null)
                {
                    transaction.Rollback();
                    throw new KeyNotFoundException($"Client with ID {client.Id} not found");
                }

                transaction.Commit();
                return updated;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for client {ClientId}", client.Id);
                throw new InvalidOperationException("Failed to update client.", ex);
            }
        }

        public async Task<Client> UpdatePasswordAsync(Client client)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                const string sql = @"
                    UPDATE clients SET
                        encrypted_password = @EncryptedPassword,
                        updated_at = @UpdatedAt
                    WHERE email = @Email
                    RETURNING
                        id AS Id,
                        first_name AS FirstName,
                        last_name AS LastName,
                        email AS Email,
                        phone_primary AS PhonePrimary,
                        phone_secondary AS PhoneSecondary,
                        address_line1 AS AddressLine1,
                        address_line2 AS AddressLine2,
                        city AS City,
                        state AS State,
                        postal_code AS PostalCode,
                        emergency_contact_name AS EmergencyContactName,
                        emergency_contact_phone AS EmergencyContactPhone,
                        notes AS Notes,
                        is_active AS IsActive,
                        is_premium AS IsPremium,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt,
                        encrypted_password AS EncryptedPassword;";

                client.UpdatedAt = DateTimeOffset.UtcNow;
                var updated = await connection.QuerySingleOrDefaultAsync<Client>(sql, client, transaction);
                if (updated == null)
                {
                    transaction.Rollback();
                    throw new KeyNotFoundException($"Client with email {client.Email} not found");
                }

                transaction.Commit();
                return updated;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdatePasswordAsync for client email {Email}", client.Email);
                throw new InvalidOperationException("Failed to update client password.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                const string sql = "DELETE FROM clients WHERE id = @Id";
                var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id }, transaction);
                transaction.Commit();
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in DeleteAsync for client {ClientId}", id);
                throw new InvalidOperationException("Failed to delete client.", ex);
            }
        }



        public async Task<Client?> GetByEmailAndCompanyAsync(string email, Guid companyId)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT
                        id AS Id,
                        company_id AS CompanyId,
                        first_name AS FirstName,
                        last_name AS LastName,
                        email AS Email,
                        phone_primary AS PhonePrimary,
                        phone_secondary AS PhoneSecondary,
                        address_line1 AS AddressLine1,
                        address_line2 AS AddressLine2,
                        city AS City,
                        state AS State,
                        postal_code AS PostalCode,
                        emergency_contact_name AS EmergencyContactName,
                        emergency_contact_phone AS EmergencyContactPhone,
                        notes AS Notes,
                        is_active AS IsActive,
                        is_premium AS IsPremium,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt,
                        encrypted_password AS EncryptedPassword
                    FROM clients
                    WHERE LOWER(TRIM(email)) = LOWER(TRIM(@Email))
                      AND company_id = @CompanyId AND is_active = true";
                return await connection.QueryFirstOrDefaultAsync<Client>(sql, new { Email = email, CompanyId = companyId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByEmailAndCompanyAsync for email {Email}", email);
                throw new InvalidOperationException("Failed to retrieve client by email and company.", ex);
            }
        }

        public async Task<Client> GetByEmailAsync(string email)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT
                        id AS Id,
                        company_id AS CompanyId,
                        first_name AS FirstName,
                        last_name AS LastName,
                        email AS Email,
                        phone_primary AS PhonePrimary,
                        phone_secondary AS PhoneSecondary,
                        address_line1 AS AddressLine1,
                        address_line2 AS AddressLine2,
                        city AS City,
                        state AS State,
                        postal_code AS PostalCode,
                        emergency_contact_name AS EmergencyContactName,
                        emergency_contact_phone AS EmergencyContactPhone,
                        notes AS Notes,
                        is_active AS IsActive,
                        is_premium AS IsPremium,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt,
                        encrypted_password AS EncryptedPassword
                    FROM clients
                    WHERE email = @Email";

                return await connection.QueryFirstOrDefaultAsync<Client>(sql, new { Email = email });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByEmailAsync for email {Email}", email);
                throw new InvalidOperationException("Failed to retrieve client by email.", ex);
            }
        }
    }
}
