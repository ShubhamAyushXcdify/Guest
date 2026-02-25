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
    public class ClinicRepository : IClinicRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ClinicRepository> _logger;

        public ClinicRepository(DapperDbContext dbContext, ILogger<ClinicRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Clinic?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT
                        c.id,
                        c.company_id,
                        co.name as company_name,
                        c.name,
                        c.address_line1,
                        c.address_line2,
                        c.city,
                        c.state,
                        c.postal_code,
                        c.country,
                        c.phone,
                        c.email,
                        c.website,
                        c.tax_id,
                        c.license_number,
                        c.subscription_status,
                        c.subscription_expires_at,
                        c.created_at,
                        c.updated_at,
                        c.is_active,
                        c.location_lat,
                        c.location_lng,
                        c.location_address
                    FROM clinics c
                    LEFT JOIN company co ON c.company_id = co.id
                    WHERE c.id = @Id AND c.is_active = true";

                var result = await connection.QueryAsync(sql, new { Id = id });
                var clinicData = result.FirstOrDefault();

                if (clinicData == null) return null;

                // Convert dynamic to dictionary for safer property access
                var dataDict = (IDictionary<string, object>)clinicData;

                return new Clinic
                {
                    Id = (Guid)dataDict["id"],
                    CompanyId = dataDict["company_id"] as Guid?,
                    CompanyName = dataDict["company_name"] as string,
                    Name = (dataDict["name"] as string) ?? string.Empty,
                    AddressLine1 = dataDict["address_line1"] as string,
                    AddressLine2 = dataDict["address_line2"] as string,
                    City = dataDict["city"] as string,
                    State = dataDict["state"] as string,
                    PostalCode = dataDict["postal_code"] as string,
                    Country = dataDict["country"] as string,
                    Phone = dataDict["phone"] as string,
                    Email = dataDict["email"] as string,
                    Website = dataDict["website"] as string,
                    TaxId = dataDict["tax_id"] as string,
                    LicenseNumber = dataDict["license_number"] as string,
                    SubscriptionStatus = dataDict["subscription_status"] as string,
                    SubscriptionExpiresAt = dataDict["subscription_expires_at"] as DateTimeOffset?,
                    CreatedAt = dataDict["created_at"] as DateTimeOffset?,
                    UpdatedAt = dataDict["updated_at"] as DateTimeOffset?,
                    IsActive = dataDict["is_active"] as bool? ?? true,
                    Location = new Location
                    {
                        Lat = dataDict["location_lat"] as double?,
                        Lng = dataDict["location_lng"] as double?,
                        Address = dataDict["location_address"] as string
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for clinic {ClinicId}", id);
                throw new InvalidOperationException("Failed to retrieve clinic.", ex);
            }
        }

        public async Task<(IEnumerable<Clinic> Items, int TotalCount)> GetAllAsync(
    int pageNumber,
    int pageSize,
    bool paginationRequired = true,
    Guid? companyId = null,
    Guid? userId = null,
    string? name = null,
    string? city = null,
    string? state = null,
    string? country = null,
    string? phone = null,
    string? email = null)
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                // Build WHERE clause for filtering
                var whereConditions = new List<string> { "c.is_active = true" }; // Always filter active clinics
                if (companyId.HasValue) whereConditions.Add("c.company_id = @CompanyId");
                if (userId.HasValue) whereConditions.Add("ucm.user_id = @UserId");
                if (!string.IsNullOrWhiteSpace(name)) whereConditions.Add("c.name ILIKE @Name");
                if (!string.IsNullOrWhiteSpace(city)) whereConditions.Add("c.city ILIKE @City");
                if (!string.IsNullOrWhiteSpace(state)) whereConditions.Add("c.state ILIKE @State");
                if (!string.IsNullOrWhiteSpace(country)) whereConditions.Add("c.country ILIKE @Country");
                if (!string.IsNullOrWhiteSpace(phone)) whereConditions.Add("c.phone ILIKE @Phone");
                if (!string.IsNullOrWhiteSpace(email)) whereConditions.Add("c.email ILIKE @Email");

                var whereClause = whereConditions.Any()
                    ? "WHERE " + string.Join(" AND ", whereConditions)
                    : "";

                // Count query
                var countSql = $@"
            SELECT COUNT(DISTINCT c.id)
            FROM clinics c
            LEFT JOIN company co ON c.company_id = co.id
            LEFT JOIN users_clinic_mapping ucm ON c.id = ucm.clinic_id AND ucm.is_active = true
            {whereClause}";

                // Reusable parameter set
                var parameters = new DynamicParameters();
                if (companyId.HasValue) parameters.Add("CompanyId", companyId.Value);
                if (userId.HasValue) parameters.Add("UserId", userId.Value);
                if (!string.IsNullOrWhiteSpace(name)) parameters.Add("Name", $"%{name}%");
                if (!string.IsNullOrWhiteSpace(city)) parameters.Add("City", $"%{city}%");
                if (!string.IsNullOrWhiteSpace(state)) parameters.Add("State", $"%{state}%");
                if (!string.IsNullOrWhiteSpace(country)) parameters.Add("Country", $"%{country}%");
                if (!string.IsNullOrWhiteSpace(phone)) parameters.Add("Phone", $"%{phone}%");
                if (!string.IsNullOrWhiteSpace(email)) parameters.Add("Email", $"%{email}%");

                // Execute count
                var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

                // Data query
                var sql = $@"
            SELECT DISTINCT
                c.id,
                c.company_id,
                co.name as company_name,
                c.name,
                c.address_line1,
                c.address_line2,
                c.city,
                c.state,
                c.postal_code,
                c.country,
                c.phone,
                c.email,
                c.website,
                c.tax_id,
                c.license_number,
                c.subscription_status,
                c.subscription_expires_at,
                c.created_at,
                c.updated_at,
                c.is_active,
                c.location_lat,
                c.location_lng,
                c.location_address
            FROM clinics c
            LEFT JOIN company co ON c.company_id = co.id
            LEFT JOIN users_clinic_mapping ucm ON c.id = ucm.clinic_id AND ucm.is_active = true
            {whereClause}
            ORDER BY c.created_at DESC";

                if (paginationRequired)
                {
                    var offset = (pageNumber - 1) * pageSize;
                    sql += " LIMIT @PageSize OFFSET @Offset";
                    parameters.Add("PageSize", pageSize);
                    parameters.Add("Offset", offset);
                }

                var results = await connection.QueryAsync(sql, parameters);
                var items = results.Select(clinicData =>
                {
                    var dataDict = (IDictionary<string, object>)clinicData;

                    return new Clinic
                    {
                        Id = (Guid)dataDict["id"],
                        CompanyId = dataDict["company_id"] as Guid?,
                        CompanyName = dataDict["company_name"] as string,
                        Name = (dataDict["name"] as string) ?? string.Empty,
                        AddressLine1 = dataDict["address_line1"] as string,
                        AddressLine2 = dataDict["address_line2"] as string,
                        City = dataDict["city"] as string,
                        State = dataDict["state"] as string,
                        PostalCode = dataDict["postal_code"] as string,
                        Country = dataDict["country"] as string,
                        Phone = dataDict["phone"] as string,
                        Email = dataDict["email"] as string,
                        Website = dataDict["website"] as string,
                        TaxId = dataDict["tax_id"] as string,
                        LicenseNumber = dataDict["license_number"] as string,
                        SubscriptionStatus = dataDict["subscription_status"] as string,
                        SubscriptionExpiresAt = dataDict["subscription_expires_at"] as DateTimeOffset?,
                        CreatedAt = dataDict["created_at"] as DateTimeOffset?,
                        UpdatedAt = dataDict["updated_at"] as DateTimeOffset?,
                        IsActive = dataDict["is_active"] as bool? ?? true,
                        Location = new Location
                        {
                            Lat = dataDict["location_lat"] as double?,
                            Lng = dataDict["location_lng"] as double?,
                            Address = dataDict["location_address"] as string
                        }
                    };
                });

                return (items, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get all clinics", ex);
            }
        }


        public async Task<Clinic> AddAsync(Clinic clinic)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Generate new ID if not provided
                if (clinic.Id == Guid.Empty)
                {
                    clinic.Id = Guid.NewGuid();
                }

                // Set timestamps
                clinic.CreatedAt = DateTimeOffset.UtcNow;
                clinic.UpdatedAt = DateTimeOffset.UtcNow;

                const string sql = @"
                    INSERT INTO clinics (
                        id, company_id, name, address_line1, address_line2, city, state, postal_code, country,
                        phone, email, website, tax_id, license_number, subscription_status,
                        subscription_expires_at, created_at, updated_at, is_active, location_lat, location_lng, location_address
                    ) VALUES (
                        @Id, @CompanyId, @Name, @AddressLine1, @AddressLine2, @City, @State, @PostalCode, @Country,
                        @Phone, @Email, @Website, @TaxId, @LicenseNumber, @SubscriptionStatus,
                        @SubscriptionExpiresAt, @CreatedAt, @UpdatedAt, @IsActive, @LocationLat, @LocationLng, @LocationAddress
                    )
                    RETURNING
                        id,
                        company_id,
                        name,
                        address_line1,
                        address_line2,
                        city,
                        state,
                        postal_code,
                        country,
                        phone,
                        email,
                        website,
                        tax_id,
                        license_number,
                        subscription_status,
                        subscription_expires_at,
                        created_at,
                        updated_at,
                        is_active,
                        location_lat,
                        location_lng,
                        location_address;";

                var parameters = new
                {
                    clinic.Id,
                    clinic.CompanyId,
                    clinic.Name,
                    clinic.AddressLine1,
                    clinic.AddressLine2,
                    clinic.City,
                    clinic.State,
                    clinic.PostalCode,
                    clinic.Country,
                    clinic.Phone,
                    clinic.Email,
                    clinic.Website,
                    clinic.TaxId,
                    clinic.LicenseNumber,
                    clinic.SubscriptionStatus,
                    clinic.SubscriptionExpiresAt,
                    clinic.CreatedAt,
                    clinic.UpdatedAt,
                    IsActive = clinic.IsActive,
                    LocationLat = clinic.Location?.Lat,
                    LocationLng = clinic.Location?.Lng,
                    LocationAddress = clinic.Location?.Address
                };

                var result = await connection.QuerySingleAsync<dynamic>(sql, parameters, transaction);

                // Use strongly typed approach instead of dynamic
                var createdClinic = new Clinic
                {
                    Id = result.id,
                    CompanyId = result.company_id,
                    Name = result.name ?? string.Empty,
                    AddressLine1 = result.address_line1,
                    AddressLine2 = result.address_line2,
                    City = result.city,
                    State = result.state,
                    PostalCode = result.postal_code,
                    Country = result.country,
                    Phone = result.phone,
                    Email = result.email,
                    Website = result.website,
                    TaxId = result.tax_id,
                    LicenseNumber = result.license_number,
                    SubscriptionStatus = result.subscription_status,
                    SubscriptionExpiresAt = result.subscription_expires_at,
                    CreatedAt = result.created_at,
                    UpdatedAt = result.updated_at,
                    IsActive = result.is_active ?? true,
                    Location = new Location
                    {
                        Lat = result.location_lat,
                        Lng = result.location_lng,
                        Address = result.location_address
                    }
                };

                transaction.Commit();
                return createdClinic;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in AddAsync");
                throw new InvalidOperationException("Failed to create clinic.", ex);
            }
        }

        public async Task<Clinic> UpdateAsync(Clinic clinic)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Set updated timestamp
                clinic.UpdatedAt = DateTimeOffset.UtcNow;

                const string sql = @"
                    UPDATE clinics SET
                        company_id = @CompanyId,
                        name = @Name,
                        address_line1 = @AddressLine1,
                        address_line2 = @AddressLine2,
                        city = @City,
                        state = @State,
                        postal_code = @PostalCode,
                        country = @Country,
                        phone = @Phone,
                        email = @Email,
                        website = @Website,
                        tax_id = @TaxId,
                        license_number = @LicenseNumber,
                        subscription_status = @SubscriptionStatus,
                        subscription_expires_at = @SubscriptionExpiresAt,
                        updated_at = @UpdatedAt,
                        location_lat = @LocationLat,
                        location_lng = @LocationLng,
                        location_address = @LocationAddress
                    WHERE id = @Id AND is_active = true
                    RETURNING
                        id,
                        company_id,
                        name,
                        address_line1,
                        address_line2,
                        city,
                        state,
                        postal_code,
                        country,
                        phone,
                        email,
                        website,
                        tax_id,
                        license_number,
                        subscription_status,
                        subscription_expires_at,
                        created_at,
                        updated_at,
                        is_active,
                        location_lat,
                        location_lng,
                        location_address;";

                var parameters = new
                {
                    clinic.Id,
                    clinic.CompanyId,
                    clinic.Name,
                    clinic.AddressLine1,
                    clinic.AddressLine2,
                    clinic.City,
                    clinic.State,
                    clinic.PostalCode,
                    clinic.Country,
                    clinic.Phone,
                    clinic.Email,
                    clinic.Website,
                    clinic.TaxId,
                    clinic.LicenseNumber,
                    clinic.SubscriptionStatus,
                    clinic.SubscriptionExpiresAt,
                    clinic.UpdatedAt,
                    LocationLat = clinic.Location?.Lat,
                    LocationLng = clinic.Location?.Lng,
                    LocationAddress = clinic.Location?.Address
                };

                var result = await connection.QuerySingleOrDefaultAsync<dynamic>(sql, parameters, transaction);
                if (result == null)
                {
                    transaction.Rollback();
                    throw new KeyNotFoundException($"Clinic with ID {clinic.Id} not found");
                }

                // Use strongly typed approach instead of dynamic
                var updatedClinic = new Clinic
                {
                    Id = result.id,
                    CompanyId = result.company_id,
                    Name = result.name ?? string.Empty,
                    AddressLine1 = result.address_line1,
                    AddressLine2 = result.address_line2,
                    City = result.city,
                    State = result.state,
                    PostalCode = result.postal_code,
                    Country = result.country,
                    Phone = result.phone,
                    Email = result.email,
                    Website = result.website,
                    TaxId = result.tax_id,
                    LicenseNumber = result.license_number,
                    SubscriptionStatus = result.subscription_status,
                    SubscriptionExpiresAt = result.subscription_expires_at,
                    CreatedAt = result.created_at,
                    UpdatedAt = result.updated_at,
                    IsActive = result.is_active ?? true,
                    Location = new Location
                    {
                        Lat = result.location_lat,
                        Lng = result.location_lng,
                        Address = result.location_address
                    }
                };

                transaction.Commit();
                return updatedClinic;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync for clinic {ClinicId}", clinic.Id);
                throw new InvalidOperationException("Failed to update clinic.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Soft delete all user-clinic mappings for this clinic
                // This removes users from the deleted clinic, but keeps their assignments to other clinics
                const string softDeleteUserClinicsSql = "UPDATE user_clinics SET is_active = false WHERE clinic_id = @ClinicId AND is_active = true";
                const string softDeleteUsersClinicMappingSql = "UPDATE users_clinic_mapping SET is_active = false, updated_at = @UpdatedAt WHERE clinic_id = @ClinicId AND is_active = true";
                
                await connection.ExecuteAsync(softDeleteUserClinicsSql, new { ClinicId = id }, transaction);
                await connection.ExecuteAsync(softDeleteUsersClinicMappingSql, new { ClinicId = id, UpdatedAt = DateTimeOffset.UtcNow }, transaction);
                
                // Soft delete: set is_active = false instead of deleting
                const string sql = "UPDATE clinics SET is_active = false, updated_at = @UpdatedAt WHERE id = @Id AND is_active = true";
                var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, UpdatedAt = DateTimeOffset.UtcNow }, transaction);
                
                transaction.Commit();
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in DeleteAsync for clinic {ClinicId}", id);
                throw new InvalidOperationException("Failed to delete clinic.", ex);
            }
        }
    }
}
