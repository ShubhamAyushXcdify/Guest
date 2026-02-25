using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using System.Linq;
using Core.DTOs;

namespace Infrastructure.Repositories
{
    public class SupplierRepository : ISupplierRepository
    {
        private readonly DapperDbContext _dbContext;

        public SupplierRepository(DapperDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<Supplier?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = "SELECT * FROM suppliers WHERE id = @Id";
                return await connection.QueryFirstOrDefaultAsync<Supplier>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetByIdAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<(IEnumerable<Supplier> Items, int TotalCount)> GetAllAsync(SupplierFilterCoreDto filter)
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (filter.ClinicId.HasValue)
                {
                    whereClauses.Add("s.clinic_id = @ClinicId");
                    parameters.Add("ClinicId", filter.ClinicId.Value);
                }

                if (filter.CompanyId.HasValue)
                {
                    whereClauses.Add("c.company_id = @CompanyId");
                    parameters.Add("CompanyId", filter.CompanyId.Value);
                }

                if (!string.IsNullOrWhiteSpace(filter.Name))
                {
                    whereClauses.Add("s.name ILIKE @Name");
                    parameters.Add("Name", $"%{filter.Name}%");
                }

                if (!string.IsNullOrWhiteSpace(filter.ContactPerson))
                {
                    whereClauses.Add("s.contact_person ILIKE @ContactPerson");
                    parameters.Add("ContactPerson", $"%{filter.ContactPerson}%");
                }

                if (!string.IsNullOrWhiteSpace(filter.Email))
                {
                    whereClauses.Add("s.email ILIKE @Email");
                    parameters.Add("Email", $"%{filter.Email}%");
                }

                if (!string.IsNullOrWhiteSpace(filter.City))
                {
                    whereClauses.Add("s.city ILIKE @City");
                    parameters.Add("City", $"%{filter.City}%");
                }

                if (!string.IsNullOrWhiteSpace(filter.State))
                {
                    whereClauses.Add("s.state ILIKE @State");
                    parameters.Add("State", $"%{filter.State}%");
                }

                if (!string.IsNullOrWhiteSpace(filter.ClinicName))
                {
                    whereClauses.Add("c.name ILIKE @ClinicName");
                    parameters.Add("ClinicName", $"%{filter.ClinicName}%");
                }
                if (!string.IsNullOrWhiteSpace(filter.Phone))
                {
                    whereClauses.Add("s.phone ILIKE @Phone");
                    parameters.Add("Phone", $"%{filter.Phone}%");
                }


                var whereClause = whereClauses.Count > 0 ? "WHERE " + string.Join(" AND ", whereClauses) : "";
                var offset = (filter.PageNumber - 1) * filter.PageSize;

                // Count query with join when companyId is provided
                var countSql =  $@"SELECT COUNT(*) FROM suppliers s
                         LEFT JOIN clinics c ON s.clinic_id = c.id
                         {whereClause}";

                var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

                // Main query with join when companyId is provided
                var sql = $@"SELECT s.* FROM suppliers s
                         LEFT JOIN clinics c ON s.clinic_id = c.id
                         {whereClause}
                         ORDER BY s.created_at DESC
                         LIMIT @PageSize OFFSET @Offset";

                parameters.Add("PageSize", filter.PageSize);
                parameters.Add("Offset", offset);
                
                var items = await connection.QueryAsync<Supplier>(sql, parameters);
                return (items, totalCount);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<Supplier> AddAsync(Supplier supplier)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                // Generate new ID if not provided
                if (supplier.Id == Guid.Empty)
                {
                    supplier.Id = Guid.NewGuid();
                }

                const string sql = @"
                    INSERT INTO suppliers (
                        id, clinic_id, name, contact_person, email, phone, address_line1, address_line2,
                        city, state, postal_code, account_number, payment_terms, is_active, created_at, updated_at
                    ) VALUES (
                        @Id, @ClinicId, @Name, @ContactPerson, @Email, @Phone, @AddressLine1, @AddressLine2,
                        @City, @State, @PostalCode, @AccountNumber, @PaymentTerms, @IsActive, @CreatedAt, @UpdatedAt
                    )
                    RETURNING *;";
                
                return await connection.QuerySingleAsync<Supplier>(sql, supplier);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddAsync: {ex.Message}");
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        public async Task<Supplier> UpdateAsync(Supplier supplier)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                // Get existing supplier to compare values
                var existingSupplier = await GetByIdAsync(supplier.Id);
                if (existingSupplier == null)
                    throw new KeyNotFoundException("Supplier not found.");

                // Build dynamic update query based on changed values
                var setClauses = new List<string>();
                var parameters = new DynamicParameters();
                parameters.Add("Id", supplier.Id);

                // Only include fields that have changed
                if (supplier.ClinicId != existingSupplier.ClinicId)
                {
                    setClauses.Add("clinic_id = @ClinicId");
                    parameters.Add("ClinicId", supplier.ClinicId);
                }
                if (supplier.Name != existingSupplier.Name)
                {
                    setClauses.Add("name = @Name");
                    parameters.Add("Name", supplier.Name);
                }
                if (supplier.ContactPerson != existingSupplier.ContactPerson)
                {
                    setClauses.Add("contact_person = @ContactPerson");
                    parameters.Add("ContactPerson", supplier.ContactPerson);
                }
                if (supplier.Email != existingSupplier.Email)
                {
                    setClauses.Add("email = @Email");
                    parameters.Add("Email", supplier.Email);
                }
                if (supplier.Phone != existingSupplier.Phone)
                {
                    setClauses.Add("phone = @Phone");
                    parameters.Add("Phone", supplier.Phone);
                }
                if (supplier.AddressLine1 != existingSupplier.AddressLine1)
                {
                    setClauses.Add("address_line1 = @AddressLine1");
                    parameters.Add("AddressLine1", supplier.AddressLine1);
                }
                if (supplier.AddressLine2 != existingSupplier.AddressLine2)
                {
                    setClauses.Add("address_line2 = @AddressLine2");
                    parameters.Add("AddressLine2", supplier.AddressLine2);
                }
                if (supplier.City != existingSupplier.City)
                {
                    setClauses.Add("city = @City");
                    parameters.Add("City", supplier.City);
                }
                if (supplier.State != existingSupplier.State)
                {
                    setClauses.Add("state = @State");
                    parameters.Add("State", supplier.State);
                }
                if (supplier.PostalCode != existingSupplier.PostalCode)
                {
                    setClauses.Add("postal_code = @PostalCode");
                    parameters.Add("PostalCode", supplier.PostalCode);
                }
                if (supplier.AccountNumber != existingSupplier.AccountNumber)
                {
                    setClauses.Add("account_number = @AccountNumber");
                    parameters.Add("AccountNumber", supplier.AccountNumber);
                }
                if (supplier.PaymentTerms != existingSupplier.PaymentTerms)
                {
                    setClauses.Add("payment_terms = @PaymentTerms");
                    parameters.Add("PaymentTerms", supplier.PaymentTerms);
                }
                if (supplier.IsActive != existingSupplier.IsActive)
                {
                    setClauses.Add("is_active = @IsActive");
                    parameters.Add("IsActive", supplier.IsActive);
                }

                if (setClauses.Count == 0) // No changes
                {
                    return existingSupplier;
                }

                // Add updated_at timestamp
                setClauses.Add("updated_at = @UpdatedAt");
                parameters.Add("UpdatedAt", DateTimeOffset.UtcNow);

                var setClause = string.Join(", ", setClauses);
                var sql = $"UPDATE suppliers SET {setClause} WHERE id = @Id RETURNING *;";

                var result = await connection.QuerySingleOrDefaultAsync<Supplier>(sql, parameters);
                if (result == null)
                    throw new KeyNotFoundException("Supplier not found.");

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
                const string sql = "DELETE FROM suppliers WHERE id = @Id";
                var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteAsync: {ex.Message}");
                throw;
            }
        }
    }
}
