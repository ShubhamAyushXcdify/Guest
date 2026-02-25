using Dapper;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class CompanyRepository : ICompanyRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<CompanyRepository> _logger;

        public CompanyRepository(DapperDbContext dbContext, ILogger<CompanyRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<bool> ExistsActiveByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return false;
            using var connection = _dbContext.GetConnection();
            const string query = "SELECT EXISTS(SELECT 1 FROM company WHERE name = @Name AND is_active = true);";
            return await connection.ExecuteScalarAsync<bool>(query, new { Name = name.Trim() });
        }

        public async Task<Company> CreateAsync(Company company)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                var query = @"
INSERT INTO company 
(name, description, logo_url, registration_number, email, phone, domain_name, address, privacy_policy, terms_of_use, status) 
VALUES 
(@Name, @Description, @LogoUrl, @RegistrationNumber, @Email, @Phone, @DomainName, @Address::jsonb, @PrivacyPolicy, @TermsOfUse, @Status) 
RETURNING 
    id AS Id,
    name AS Name,
    description AS Description,
    logo_url AS LogoUrl,
    registration_number AS RegistrationNumber,
    email AS Email,
    phone AS Phone,
    domain_name AS DomainName,
    address AS Address,
    privacy_policy AS PrivacyPolicy,
    terms_of_use AS TermsOfUse,
    status AS Status,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    is_active AS IsActive;";

                var createdCompany = await connection.QuerySingleAsync<Company>(query, company, transaction);
                transaction.Commit();
                return createdCompany;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                Console.WriteLine($"Error in CreateAsync: {ex.Message}");
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        public async Task<Company?> GetByIdAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            var query = @"
SELECT 
    id AS Id,
    name AS Name,
    description AS Description,
    logo_url AS LogoUrl,
    registration_number AS RegistrationNumber,
    email AS Email,
    phone AS Phone,
    domain_name AS DomainName,
    address AS Address,
    privacy_policy AS PrivacyPolicy,
    terms_of_use AS TermsOfUse,
    status AS Status,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    is_active AS IsActive
FROM company 
WHERE id = @Id AND is_active = true;";

            return await connection.QuerySingleOrDefaultAsync<Company>(query, new { Id = id });
        }

        public async Task<IEnumerable<Company>> GetAllAsync()
        {
            using var connection = _dbContext.GetConnection();
            var query = @"
SELECT 
    id AS Id,
    name AS Name,
    description AS Description,
    logo_url AS LogoUrl,
    registration_number AS RegistrationNumber,
    email AS Email,
    phone AS Phone,
    domain_name AS DomainName,
    address AS Address,
    privacy_policy AS PrivacyPolicy,
    terms_of_use AS TermsOfUse,
    status AS Status,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    is_active AS IsActive
FROM company 
WHERE is_active = true
ORDER BY created_at DESC;";

            return await connection.QueryAsync<Company>(query);
        }

        public async Task<(IEnumerable<Company> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            bool paginationRequired = true,
            string? domainName = null)
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                // Build WHERE clause for filtering
                var whereClause = "WHERE is_active = true";
                var parameters = new DynamicParameters();
                
                if (!string.IsNullOrWhiteSpace(domainName))
                {
                    whereClause += " AND domain_name ILIKE @DomainName";
                    parameters.Add("DomainName", $"%{domainName}%");
                }

                // Get total count
                var countQuery = $@"
                    SELECT COUNT(*)
                    FROM company
                    {whereClause}";

                var totalCount = await connection.ExecuteScalarAsync<int>(countQuery, parameters);

                // Get paginated data
                var query = $@"
                    SELECT
                        id AS Id,
                        name AS Name,
                        description AS Description,
                        logo_url AS LogoUrl,
                        registration_number AS RegistrationNumber,
                        email AS Email,
                        phone AS Phone,
                        domain_name AS DomainName,
                        address AS Address,
                        privacy_policy AS PrivacyPolicy,
                        terms_of_use AS TermsOfUse,
                        status AS Status,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt,
                        is_active AS IsActive
                    FROM company
                    {whereClause}
                    ORDER BY created_at DESC";

                if (paginationRequired)
                {
                    var offset = (pageNumber - 1) * pageSize;
                    query += " LIMIT @PageSize OFFSET @Offset";
                    parameters.Add("PageSize", pageSize);
                    parameters.Add("Offset", offset);

                    var companies = await connection.QueryAsync<Company>(query, parameters);

                    return (companies, totalCount);
                }
                else
                {
                    var companies = await connection.QueryAsync<Company>(query, parameters);
                    return (companies, totalCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync with pagination");
                throw new InvalidOperationException("Failed to retrieve companies.", ex);
            }
        }

        public async Task<Company> UpdateAsync(Company company)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                var setClauses = new List<string>();
                var parameters = new DynamicParameters();
                parameters.Add("Id", company.Id);

                if (!string.IsNullOrWhiteSpace(company.Name))
                {
                    setClauses.Add("name = @Name");
                    parameters.Add("Name", company.Name);
                }

                if (company.Description != null)
                {
                    setClauses.Add("description = @Description");
                    parameters.Add("Description", company.Description);
                }

                if (company.LogoUrl != null)
                {
                    setClauses.Add("logo_url = @LogoUrl");
                    parameters.Add("LogoUrl", company.LogoUrl);
                }

                if (company.RegistrationNumber != null)
                {
                    setClauses.Add("registration_number = @RegistrationNumber");
                    parameters.Add("RegistrationNumber", company.RegistrationNumber);
                }

                if (company.Email != null)
                {
                    setClauses.Add("email = @Email");
                    parameters.Add("Email", company.Email);
                }

                if (company.Phone != null)
                {
                    setClauses.Add("phone = @Phone");
                    parameters.Add("Phone", company.Phone);
                }

                if (company.DomainName != null)
                {
                    setClauses.Add("domain_name = @DomainName");
                    parameters.Add("DomainName", company.DomainName);
                }

                if (company.Address != null)
                {
                    setClauses.Add("address = @Address::jsonb");
                    parameters.Add("Address", company.Address);
                }

                if (company.PrivacyPolicy != null)
                {
                    setClauses.Add("privacy_policy = @PrivacyPolicy");
                    parameters.Add("PrivacyPolicy", company.PrivacyPolicy);
                }

                if (company.TermsOfUse != null)
                {
                    setClauses.Add("terms_of_use = @TermsOfUse");
                    parameters.Add("TermsOfUse", company.TermsOfUse);
                }

                if (!string.IsNullOrWhiteSpace(company.Status))
                {
                    setClauses.Add("status = @Status");
                    parameters.Add("Status", company.Status);
                }

                setClauses.Add("updated_at = CURRENT_TIMESTAMP");

                if (setClauses.Count == 1) // Only updated_at, nothing else changed
                    throw new InvalidOperationException("No fields to update.");

                var setClause = string.Join(", ", setClauses);
                var query = $@"
UPDATE company
SET {setClause}
WHERE id = @Id
RETURNING 
    id AS Id,
    name AS Name,
    description AS Description,
    logo_url AS LogoUrl,
    registration_number AS RegistrationNumber,
    email AS Email,
    phone AS Phone,
    domain_name AS DomainName,
    address AS Address,
    privacy_policy AS PrivacyPolicy,
    terms_of_use AS TermsOfUse,
    status AS Status,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    is_active AS IsActive;";

                var updatedCompany = await connection.QuerySingleAsync<Company>(query, parameters, transaction);
                transaction.Commit();
                return updatedCompany;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                Console.WriteLine($"Error in UpdateAsync: {ex.Message}");
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            var query = "UPDATE company SET is_active = false WHERE id = @Id;";
            var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
            return rowsAffected > 0;
        }
    }
}
