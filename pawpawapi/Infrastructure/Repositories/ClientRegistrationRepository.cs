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
    public class ClientRegistrationRepository : IClientRegistrationRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ClientRegistrationRepository> _logger;

        public ClientRegistrationRepository(DapperDbContext dbContext, ILogger<ClientRegistrationRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ClientRegistration> CreateAsync(ClientRegistration registration)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Generate new ID if not provided
                if (registration.Id == Guid.Empty)
                {
                    registration.Id = Guid.NewGuid();
                }

                // Set default values and timestamps
                registration.Status = "pending";
                registration.CreatedAt = DateTimeOffset.UtcNow;
                registration.UpdatedAt = DateTimeOffset.UtcNow;

                const string sql = @"
                    INSERT INTO client_registrations (
                        id, company_id, first_name, last_name, email, password, phone_primary, phone_secondary,
                        address_line1, address_line2, city, state, postal_code,
                        emergency_contact_name, emergency_contact_phone, notes, status,
                        created_at, updated_at
                    ) VALUES (
                        @Id, @CompanyId, @FirstName, @LastName, @Email, @Password, @PhonePrimary, @PhoneSecondary,
                        @AddressLine1, @AddressLine2, @City, @State, @PostalCode,
                        @EmergencyContactName, @EmergencyContactPhone, @Notes, @Status,
                        @CreatedAt, @UpdatedAt
                    ) RETURNING
                        id AS Id,
                        company_id AS CompanyId,
                        first_name AS FirstName,
                        last_name AS LastName,
                        email AS Email,
                        password AS Password,
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
                        status AS Status,
                        rejection_reason AS RejectionReason,
                        approved_by AS ApprovedBy,
                        approved_at AS ApprovedAt,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt;";

                var createdRegistration = await connection.QuerySingleAsync<ClientRegistration>(sql, registration, transaction);
                transaction.Commit();
                return createdRegistration;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create client registration.", ex);
            }
        }

        public async Task<ClientRegistration?> GetByIdAsync(Guid id)
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
                        password AS Password,
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
                        status AS Status,
                        rejection_reason AS RejectionReason,
                        approved_by AS ApprovedBy,
                        approved_at AS ApprovedAt,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM client_registrations
                    WHERE id = @Id";

                return await connection.QueryFirstOrDefaultAsync<ClientRegistration>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for client registration {RegistrationId}", id);
                throw new InvalidOperationException("Failed to retrieve client registration.", ex);
            }
        }

        public async Task<ClientRegistration?> GetByEmailAsync(string email)
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
                        password AS Password,
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
                        status AS Status,
                        rejection_reason AS RejectionReason,
                        approved_by AS ApprovedBy,
                        approved_at AS ApprovedAt,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM client_registrations
                    WHERE email = @Email";

                return await connection.QueryFirstOrDefaultAsync<ClientRegistration>(sql, new { Email = email });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByEmailAsync for email {Email}", email);
                throw new InvalidOperationException("Failed to retrieve client registration by email.", ex);
            }
        }

        public async Task<(IEnumerable<ClientRegistration> Items, int TotalCount)> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            string? status = null)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (!string.IsNullOrEmpty(status))
                {
                    whereClauses.Add("status = @Status");
                    parameters.Add("Status", status);
                }

                var whereClause = whereClauses.Count > 0 
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                // Get total count
                var countSql = $"SELECT COUNT(*) FROM client_registrations {whereClause}";
                var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

                // Get paginated data
                var sql = $@"
                    SELECT * FROM client_registrations 
                    {whereClause}
                    ORDER BY created_at DESC
                    LIMIT @PageSize OFFSET @Offset";

                parameters.Add("PageSize", pageSize);
                parameters.Add("Offset", (pageNumber - 1) * pageSize);

                var registrations = await connection.QueryAsync<ClientRegistration>(sql, parameters);
                return (registrations, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<ClientRegistration> UpdateAsync(ClientRegistration registration)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Set updated timestamp
                registration.UpdatedAt = DateTimeOffset.UtcNow;

                const string sql = @"
                    UPDATE client_registrations SET
                        company_id = @CompanyId,
                        first_name = @FirstName,
                        last_name = @LastName,
                        email = @Email,
                        password = @Password,
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
                        status = @Status,
                        rejection_reason = @RejectionReason,
                        approved_by = @ApprovedBy,
                        approved_at = @ApprovedAt,
                        updated_at = @UpdatedAt
                    WHERE id = @Id
                    RETURNING
                        id AS Id,
                        company_id AS CompanyId,
                        first_name AS FirstName,
                        last_name AS LastName,
                        email AS Email,
                        password AS Password,
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
                        status AS Status,
                        rejection_reason AS RejectionReason,
                        approved_by AS ApprovedBy,
                        approved_at AS ApprovedAt,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt;";

                var updated = await connection.QuerySingleOrDefaultAsync<ClientRegistration>(sql, registration, transaction);
                if (updated == null)
                {
                    transaction.Rollback();
                    throw new KeyNotFoundException($"Client registration with ID {registration.Id} not found");
                }

                transaction.Commit();
                return updated;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for client registration {RegistrationId}", registration.Id);
                throw new InvalidOperationException("Failed to update client registration.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                const string sql = "DELETE FROM client_registrations WHERE id = @Id";
                var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id }, transaction);
                transaction.Commit();
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in DeleteAsync for client registration {RegistrationId}", id);
                throw new InvalidOperationException("Failed to delete client registration.", ex);
            }
        }

        public async Task<IEnumerable<ClientRegistration>> GetPendingRegistrationsAsync()
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
                        password AS Password,
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
                        status AS Status,
                        rejection_reason AS RejectionReason,
                        approved_by AS ApprovedBy,
                        approved_at AS ApprovedAt,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM client_registrations
                    WHERE status = 'pending'
                    ORDER BY created_at DESC";

                return await connection.QueryAsync<ClientRegistration>(sql);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPendingRegistrationsAsync");
                throw new InvalidOperationException("Failed to retrieve pending client registrations.", ex);
            }
        }
    }
} 