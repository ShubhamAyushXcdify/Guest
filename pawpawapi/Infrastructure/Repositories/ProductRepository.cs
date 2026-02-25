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
    public class ProductRepository : IProductRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ProductRepository> _logger;

        public ProductRepository(DapperDbContext dbContext, ILogger<ProductRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<Product?> GetByIdAsync(Guid id)
        {
            const string sql = "SELECT * FROM products WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<Product>(sql, new { Id = id });
        }

        public async Task<(IEnumerable<Product> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            Core.Models.ProductFilter? filter = null)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                // Company filter
                if (filter?.CompanyId.HasValue == true)
                {
                    whereClauses.Add("company_id = @CompanyId");
                    parameters.Add("CompanyId", filter.CompanyId.Value);
                }

                // Search filter (across multiple fields)
                if (!string.IsNullOrWhiteSpace(filter?.Search))
                {
                    whereClauses.Add("(LOWER(product_number) LIKE @Search OR LOWER(name) LIKE @Search OR LOWER(generic_name) LIKE @Search OR LOWER(ndc_number) LIKE @Search)");
                    parameters.Add("Search", $"%{filter.Search.ToLower()}%");
                }

                // Category filter
                if (!string.IsNullOrWhiteSpace(filter?.Category))
                {
                    whereClauses.Add("LOWER(category) = @Category");
                    parameters.Add("Category", filter.Category.ToLower());
                }

                // Product type removed

                // Dosage form filter
                if (!string.IsNullOrWhiteSpace(filter?.DosageForm))
                {
                    whereClauses.Add("LOWER(dosage_form) = @DosageForm");
                    parameters.Add("DosageForm", filter.DosageForm.ToLower());
                }

                // Unit of measure filter
                if (!string.IsNullOrWhiteSpace(filter?.UnitOfMeasure))
                {
                    whereClauses.Add("LOWER(unit_of_measure) = @UnitOfMeasure");
                    parameters.Add("UnitOfMeasure", filter.UnitOfMeasure.ToLower());
                }

                // Requires prescription filter
                if (filter?.RequiresPrescription.HasValue == true)
                {
                    whereClauses.Add("requires_prescription = @RequiresPrescription");
                    parameters.Add("RequiresPrescription", filter.RequiresPrescription.Value);
                }

                // Controlled substance schedule filter
                if (!string.IsNullOrWhiteSpace(filter?.ControlledSubstanceSchedule))
                {
                    whereClauses.Add("controlled_substance_schedule = @ControlledSubstanceSchedule");
                    parameters.Add("ControlledSubstanceSchedule", filter.ControlledSubstanceSchedule);
                }

                // Is active filter
                if (filter?.IsActive.HasValue == true)
                {
                    whereClauses.Add("is_active = @IsActive");
                    parameters.Add("IsActive", filter.IsActive.Value);
                }

                // Price range filter
                if (filter?.MinPrice.HasValue == true)
                {
                    whereClauses.Add("price >= @MinPrice");
                    parameters.Add("MinPrice", filter.MinPrice.Value);
                }

                if (filter?.MaxPrice.HasValue == true)
                {
                    whereClauses.Add("price <= @MaxPrice");
                    parameters.Add("MaxPrice", filter.MaxPrice.Value);
                }

                // Selling price range filter
                if (filter?.MinSellingPrice.HasValue == true)
                {
                    whereClauses.Add("selling_price >= @MinSellingPrice");
                    parameters.Add("MinSellingPrice", filter.MinSellingPrice.Value);
                }

                if (filter?.MaxSellingPrice.HasValue == true)
                {
                    whereClauses.Add("selling_price <= @MaxSellingPrice");
                    parameters.Add("MaxSellingPrice", filter.MaxSellingPrice.Value);
                }

                // Low stock filter (requires inventory join - simplified for now)
                if (filter?.LowStock == true)
                {
                    whereClauses.Add("reorder_threshold IS NOT NULL");
                    // Note: This is a simplified version. For actual low stock filtering,
                    // you'd need to join with inventory table to check current stock levels
                }

                // Date range filters
                if (filter?.CreatedFrom.HasValue == true)
                {
                    whereClauses.Add("created_at >= @CreatedFrom");
                    parameters.Add("CreatedFrom", filter.CreatedFrom.Value);
                }

                if (filter?.CreatedTo.HasValue == true)
                {
                    whereClauses.Add("created_at <= @CreatedTo");
                    parameters.Add("CreatedTo", filter.CreatedTo.Value);
                }

                var whereClause = whereClauses.Count > 0 
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                // Build ORDER BY clause
                var orderByClause = BuildOrderByClause(filter?.SortBy, filter?.SortOrder);

                // Get total count with filters
                var countQuery = $"SELECT COUNT(*) FROM products {whereClause};";
                var totalCount = await connection.ExecuteScalarAsync<int>(countQuery, parameters);

                // Get paginated data with filters
                var query = $@"
                    SELECT *
                    FROM products
                    {whereClause}
                    {orderByClause}
                    LIMIT @PageSize
                    OFFSET @Offset;";

                parameters.Add("PageSize", pageSize);
                parameters.Add("Offset", (pageNumber - 1) * pageSize);
                
                var products = await connection.QueryAsync<Product>(query, parameters);
                
                return (products, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get all products", ex);
            }
        }

        private string BuildOrderByClause(string? sortBy, string? sortOrder)
        {
            var validSortFields = new[] { "name", "price", "created_at", "updated_at", "product_number", "category" };
            var validSortOrders = new[] { "asc", "desc" };

            var field = !string.IsNullOrWhiteSpace(sortBy) && validSortFields.Contains(sortBy.ToLower()) 
                ? sortBy.ToLower() 
                : "created_at";

            var order = !string.IsNullOrWhiteSpace(sortOrder) && validSortOrders.Contains(sortOrder.ToLower()) 
                ? sortOrder.ToLower() 
                : "desc";

            // Map DTO field names to database column names
            var fieldMapping = new Dictionary<string, string>
            {
                { "name", "name" },
                { "price", "price" },
                { "created_at", "created_at" },
                { "updated_at", "updated_at" },
                { "product_number", "product_number" },
                { "category", "category" },
                
            };

            var dbField = fieldMapping.ContainsKey(field) ? fieldMapping[field] : "created_at";
            return $"ORDER BY {dbField} {order}";
        }

        public async Task<Product> AddAsync(Product product)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();

                try
                {
                    product.Id = Guid.NewGuid();
                    product.CreatedAt = DateTimeOffset.UtcNow;
                    product.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        product.Id,
                        product.CompanyId,
                        product.ProductNumber,
                        product.Name,
                        product.GenericName,
                        product.Category,
                        product.NdcNumber,
                        product.DosageForm,
                        product.UnitOfMeasure,
                        product.RequiresPrescription,
                        product.ControlledSubstanceSchedule,
                        product.BrandName,
                        product.StorageRequirements,
                        product.IsActive,
                        product.CreatedAt,
                        product.UpdatedAt,
                        product.ReorderThreshold,
                        product.SellingPrice,
                        product.Price
                    };

                    const string sql = @"
                INSERT INTO products (
                    id, company_id, product_number, name, generic_name, category,
                    ndc_number, dosage_form, unit_of_measure, requires_prescription,
                    controlled_substance_schedule, brandname, storage_requirements, is_active,
                    created_at, updated_at, reorder_threshold, price, selling_price
                )
                VALUES (
                    @Id, @CompanyId, @ProductNumber, @Name, @GenericName, @Category,
                    @NdcNumber, @DosageForm, @UnitOfMeasure, @RequiresPrescription,
                    @ControlledSubstanceSchedule, @BrandName, @StorageRequirements, @IsActive,
                    @CreatedAt, @UpdatedAt, @ReorderThreshold, @Price, @SellingPrice
                )
                RETURNING
                    id AS Id,
                    company_id AS CompanyId,
                    product_number AS ProductNumber,
                    name AS Name,
                    generic_name AS GenericName,
                    category AS Category,
                    
                    ndc_number AS NdcNumber,
                    dosage_form AS DosageForm,
                    unit_of_measure AS UnitOfMeasure,
                    requires_prescription AS RequiresPrescription,
                    controlled_substance_schedule AS ControlledSubstanceSchedule,
                    brandname AS BrandName,
                    storage_requirements AS StorageRequirements,
                    is_active AS IsActive,
                    created_at AS CreatedAt,
                    updated_at AS UpdatedAt,
                    reorder_threshold AS ReorderThreshold,
                    selling_price AS SellingPrice,
                    price AS Price;";

                    var createdProduct = await connection.QuerySingleAsync<Product>(sql, parameters, transaction);
                    transaction.Commit();
                    return createdProduct;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in AddAsync transaction");
                    throw new InvalidOperationException("Failed to add product", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddAsync");
                throw new InvalidOperationException("Failed to add product", ex);
            }
        }


        public async Task UpdateAsync(Product product)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();

                try
                {
                    product.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        product.Id,
                        product.CompanyId,
                        product.ProductNumber,
                        product.Name,
                        product.GenericName,
                        product.Category,
                        
                        product.NdcNumber,
                        product.DosageForm,
                        product.UnitOfMeasure,
                        product.RequiresPrescription,
                        product.ControlledSubstanceSchedule,
                        product.BrandName,
                        product.StorageRequirements,
                        product.IsActive,
                        product.UpdatedAt,
                        product.ReorderThreshold,
                        product.Price,
                        product.SellingPrice
                    };

                    const string sql = @"
                UPDATE products SET
                    company_id = @CompanyId,
                    product_number = @ProductNumber,
                    name = @Name,
                    generic_name = @GenericName,
                    category = @Category,
                    ndc_number = @NdcNumber,
                    dosage_form = @DosageForm,
                    unit_of_measure = @UnitOfMeasure,
                    requires_prescription = @RequiresPrescription,
                    controlled_substance_schedule = @ControlledSubstanceSchedule,
                    brandname = @BrandName,
                    storage_requirements = @StorageRequirements,
                    is_active = @IsActive,
                    updated_at = @UpdatedAt,
                    reorder_threshold = @ReorderThreshold,
                    price = @Price,
                    selling_price = @SellingPrice
                WHERE id = @Id;";
                    await connection.ExecuteAsync(sql, product, transaction);
                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction");
                    throw new InvalidOperationException("Failed to update product", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync");
                throw new InvalidOperationException("Failed to update product", ex);
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM products WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, new { Id = id });
        }

        public async Task<object> GetFilterOptionsAsync()
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                
                var categories = await connection.QueryAsync<string>(
                    "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category");
                
                // product_type removed
                
                var dosageForms = await connection.QueryAsync<string>(
                    "SELECT DISTINCT dosage_form FROM products WHERE dosage_form IS NOT NULL AND dosage_form != '' ORDER BY dosage_form");
                
                var unitOfMeasures = await connection.QueryAsync<string>(
                    "SELECT DISTINCT unit_of_measure FROM products WHERE unit_of_measure IS NOT NULL AND unit_of_measure != '' ORDER BY unit_of_measure");
                
                var controlledSubstanceSchedules = await connection.QueryAsync<string>(
                    "SELECT DISTINCT controlled_substance_schedule FROM products WHERE controlled_substance_schedule IS NOT NULL AND controlled_substance_schedule != '' ORDER BY controlled_substance_schedule");

                var priceRange = await connection.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT MIN(price) as MinPrice, MAX(price) as MaxPrice FROM products WHERE price IS NOT NULL");

                var sellingPriceRange = await connection.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT MIN(selling_price) as MinSellingPrice, MAX(selling_price) as MaxSellingPrice FROM products WHERE selling_price IS NOT NULL");

                return new
                {
                    Categories = categories,
                    
                    DosageForms = dosageForms,
                    UnitOfMeasures = unitOfMeasures,
                    ControlledSubstanceSchedules = controlledSubstanceSchedules,
                    PriceRange = priceRange,
                    SellingPriceRange = sellingPriceRange,
                    SortOptions = new[]
                    {
                        new { Value = "name", Label = "Name" },
                        new { Value = "price", Label = "Cost Price" },
                        new { Value = "selling_price", Label = "Selling Price" },
                        new { Value = "created_at", Label = "Created Date" },
                        new { Value = "updated_at", Label = "Updated Date" },
                        new { Value = "product_number", Label = "Product Number" },
                        new { Value = "category", Label = "Category" },
                        
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetFilterOptionsAsync");
                throw new InvalidOperationException("Failed to get filter options", ex);
            }
        }

        public async Task<(IEnumerable<ProductUsageHistoryRow> Items, int TotalCount)> GetUsageHistoryByProductIdAsync(
            Guid productId,
            int pageNumber,
            int pageSize)
        {
            const string combinedCte = @"
    SELECT
        cl.name AS clinic_name,
        (c.first_name || ' ' || COALESCE(c.last_name, '')) AS client_name,
        pt.name AS patient_name,
        COALESCE(p.quantity_dispensed, p.quantity_prescribed, 0)::int AS quantity_given,
        p.dosage_instructions AS dose_frequency,
        NULL::int AS number_of_days_given,
        at.name AS appointment_type,
        COALESCE(p.dispensed_date, p.prescribed_date) AS date_given
    FROM prescriptions p
    LEFT JOIN medical_records mr ON p.medical_record_id = mr.id
    LEFT JOIN appointments a ON mr.appointment_id = a.id
    LEFT JOIN clinics cl ON COALESCE(p.clinic_id, a.clinic_id) = cl.id
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN patients pt ON COALESCE(p.patient_id, a.patient_id) = pt.id
    LEFT JOIN appointment_type at ON a.appointment_type_id = at.appointment_type_id
    WHERE p.product_id = @ProductId
      AND (p.dispensed_date IS NOT NULL OR p.prescribed_date IS NOT NULL)
    UNION ALL
    SELECT
        cl.name AS clinic_name,
        (c.first_name || ' ' || COALESCE(c.last_name, '')) AS client_name,
        pt.name AS patient_name,
        COALESCE(ppm.quantity, 0)::int AS quantity_given,
        ppm.frequency AS dose_frequency,
        ppm.number_of_days AS number_of_days_given,
        at.name AS appointment_type,
        (pd.created_at AT TIME ZONE 'UTC')::date AS date_given
    FROM prescription_product_mapping ppm
    INNER JOIN prescription_details pd ON ppm.prescription_detail_id = pd.id
    INNER JOIN visits v ON pd.visit_id = v.id
    INNER JOIN appointments a ON v.appointment_id = a.id
    LEFT JOIN clinics cl ON a.clinic_id = cl.id
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN patients pt ON a.patient_id = pt.id
    LEFT JOIN appointment_type at ON a.appointment_type_id = at.appointment_type_id
    WHERE ppm.product_id = @ProductId
";
            const string countSql = "WITH combined AS (" + combinedCte + ") SELECT COUNT(*) FROM combined";
            const string dataSql = "WITH combined AS (" + combinedCte + @")
SELECT clinic_name, client_name, patient_name, quantity_given, dose_frequency, number_of_days_given, appointment_type, date_given
FROM combined
ORDER BY date_given DESC NULLS LAST
OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

            var offset = (pageNumber - 1) * pageSize;
            var parameters = new DynamicParameters();
            parameters.Add("ProductId", productId);
            parameters.Add("Offset", offset);
            parameters.Add("PageSize", pageSize);

            using var connection = _dbContext.GetConnection();
            var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);
            var items = (await connection.QueryAsync<ProductUsageHistoryRow>(dataSql, parameters)).ToList();
            return (items, totalCount);
        }
    }
} 