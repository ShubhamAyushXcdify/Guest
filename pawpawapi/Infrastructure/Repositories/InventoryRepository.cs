using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using System.Diagnostics.Contracts;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace Infrastructure.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<InventoryRepository> _logger;

        public InventoryRepository(DapperDbContext dbContext, ILogger<InventoryRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Inventory> GetByIdAsync(Guid id)
        {
            const string sql = @"
                SELECT i.*, p.name as product_name 
                FROM inventory i
                LEFT JOIN products p ON i.product_id = p.id
                WHERE i.id = @Id";
            using var connection = _dbContext.GetConnection();
            var inventory = await connection.QueryFirstOrDefaultAsync<Inventory>(sql, new { Id = id });
            if (inventory == null)
                throw new KeyNotFoundException($"Inventory with ID {id} not found");
            return inventory;
        }

        public async Task<(IEnumerable<Inventory> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            Guid? productId = null,
            Guid? clinicId = null,
            string? search = null,
            string? productType = null,
            string? lotNumber = null,
            int? quantityOnHand = null,
            int? quantityReserved = null,
            int? reorderLevel = null,
            int? reorderQuantity = null,
            decimal? unitCost = null,
            decimal? wholesaleCost = null,
            decimal? retailPrice = null,
            string? location = null,
            string? unitOfMeasure = null,
            int? unitsPerPackage = null,
            string? batchNumber = null,
            bool? receivedFromPo = null,
            Guid? poItemId = null
        )
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                var whereClause = new List<string>();
                var parameters = new DynamicParameters();
                if (productId.HasValue)
                {
                    whereClause.Add("i.product_id = @ProductId");
                    parameters.Add("ProductId", productId.Value);
                }
                if (clinicId.HasValue)
                {
                    whereClause.Add("i.clinic_id = @ClinicId");
                    parameters.Add("ClinicId", clinicId.Value);
                }
                if (!string.IsNullOrWhiteSpace(search))
                {
                    whereClause.Add("(p.name ILIKE @Search OR i.batch_number ILIKE @Search OR i.location ILIKE @Search)");
                    parameters.Add("Search", $"%{search}%");
                }
                // product_type filter removed
                if (!string.IsNullOrWhiteSpace(lotNumber))
                {
                    whereClause.Add("i.lot_number = @LotNumber");
                    parameters.Add("LotNumber", lotNumber);
                }
                if (quantityOnHand.HasValue)
                {
                    whereClause.Add("i.quantity_on_hand = @QuantityOnHand");
                    parameters.Add("QuantityOnHand", quantityOnHand.Value);
                }
                if (quantityReserved.HasValue)
                {
                    whereClause.Add("i.quantity_reserved = @QuantityReserved");
                    parameters.Add("QuantityReserved", quantityReserved.Value);
                }
                if (reorderLevel.HasValue)
                {
                    whereClause.Add("i.reorder_level = @ReorderLevel");
                    parameters.Add("ReorderLevel", reorderLevel.Value);
                }
                if (reorderQuantity.HasValue)
                {
                    whereClause.Add("i.reorder_quantity = @ReorderQuantity");
                    parameters.Add("ReorderQuantity", reorderQuantity.Value);
                }
                if (unitCost.HasValue)
                {
                    whereClause.Add("i.unit_cost = @UnitCost");
                    parameters.Add("UnitCost", unitCost.Value);
                }
                if (wholesaleCost.HasValue)
                {
                    whereClause.Add("i.wholesale_cost = @WholesaleCost");
                    parameters.Add("WholesaleCost", wholesaleCost.Value);
                }
                if (retailPrice.HasValue)
                {
                    whereClause.Add("i.retail_price = @RetailPrice");
                    parameters.Add("RetailPrice", retailPrice.Value);
                }
                if (!string.IsNullOrWhiteSpace(location))
                {
                    whereClause.Add("i.location = @Location");
                    parameters.Add("Location", location);
                }
                if (!string.IsNullOrWhiteSpace(unitOfMeasure))
                {
                    whereClause.Add("i.unit_of_measure = @UnitOfMeasure");
                    parameters.Add("UnitOfMeasure", unitOfMeasure);
                }
                if (unitsPerPackage.HasValue)
                {
                    whereClause.Add("i.units_per_package = @UnitsPerPackage");
                    parameters.Add("UnitsPerPackage", unitsPerPackage.Value);
                }
                if (!string.IsNullOrWhiteSpace(batchNumber))
                {
                    whereClause.Add("i.batch_number = @BatchNumber");
                    parameters.Add("BatchNumber", batchNumber);
                }
                if (receivedFromPo.HasValue)
                {
                    whereClause.Add("i.received_from_po = @ReceivedFromPo");
                    parameters.Add("ReceivedFromPo", receivedFromPo.Value);
                }
                if (poItemId.HasValue)
                {
                    whereClause.Add("i.po_item_id = @PoItemId");
                    parameters.Add("PoItemId", poItemId.Value);
                }
                var whereSql = whereClause.Any() 
                    ? "WHERE " + string.Join(" AND ", whereClause)
                    : string.Empty;
                // Get total count with filters (by product/clinic)
                var countQuery = $@"
                    SELECT COUNT(*) FROM (
                        SELECT 1
                        FROM inventory i
                        LEFT JOIN products p ON i.product_id = p.id
                        {whereSql}
                        GROUP BY i.product_id, i.clinic_id
                    ) sub;";
                var totalCount = await connection.ExecuteScalarAsync<int>(countQuery, parameters);
                // Get paginated data with filters, grouped by product and clinic, with summed quantityOnHand and all other columns from the latest record
                var query = $@"
                    SELECT
                        i_all.*,
                        sums.quantity_on_hand
                    FROM (
                        SELECT DISTINCT ON (i.product_id, i.clinic_id)
                            i.*
                        FROM inventory i
                        LEFT JOIN products p ON i.product_id = p.id
                        {whereSql}
                        ORDER BY i.product_id, i.clinic_id, i.updated_at DESC
                    ) i_all
                    JOIN (
                        SELECT
                            i.product_id,
                            i.clinic_id,
                            SUM(i.quantity_on_hand) as quantity_on_hand
                        FROM inventory i
                        LEFT JOIN products p ON i.product_id = p.id
                        {whereSql.Replace("i.", "")}
                        GROUP BY i.product_id, i.clinic_id
                    ) sums
                    ON i_all.product_id = sums.product_id AND i_all.clinic_id = sums.clinic_id
                    ORDER BY i_all.updated_at DESC
                    LIMIT @PageSize
                    OFFSET @Offset;";
                parameters.Add("PageSize", pageSize);
                parameters.Add("Offset", (pageNumber - 1) * pageSize);
                var inventory = await connection.QueryAsync<Inventory>(query, parameters);
                return (inventory, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new InvalidOperationException("Failed to get all inventory items", ex);
            }
        }

        public async Task<int> GetCountAsync(Guid clinicId)
        {
            const string sql = "SELECT COUNT(*) FROM inventory WHERE clinic_id = @ClinicId";
            using var connection = _dbContext.GetConnection();
            return await connection.ExecuteScalarAsync<int>(sql, new { ClinicId = clinicId });
        }

        public async Task<IEnumerable<Inventory>> GetLowStockProductsAsync(Guid clinicId)
        {
            const string sql = @"
                SELECT
                    i_all.*,
                    sums.quantity_on_hand
                FROM (
                    SELECT DISTINCT ON (i.product_id, i.clinic_id)
                        i.*
                    FROM inventory i
                    WHERE i.clinic_id = @ClinicId
                    ORDER BY i.product_id, i.clinic_id, i.updated_at DESC
                ) i_all
                JOIN (
                    SELECT
                        product_id,
                        clinic_id,
                        SUM(quantity_on_hand) as quantity_on_hand,
                        MAX(reorder_level) as reorder_level
                    FROM inventory
                    WHERE clinic_id = @ClinicId
                    GROUP BY product_id, clinic_id
                ) sums
                ON i_all.product_id = sums.product_id AND i_all.clinic_id = sums.clinic_id
                WHERE sums.quantity_on_hand <= sums.reorder_level;";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<Inventory>(sql, new { ClinicId = clinicId });
        }

        public async Task<IEnumerable<Inventory>> GetExpiringSoonProductsAsync(Guid clinicId)
        {
            const string sql = @"
                SELECT
                    i_all.*,
                    sums.quantity_on_hand
                FROM (
                    SELECT DISTINCT ON (i.product_id, i.clinic_id)
                        i.*
                    FROM inventory i
                    WHERE i.clinic_id = @ClinicId
                    AND i.expiration_date IS NOT NULL
                    AND i.expiration_date <= CURRENT_DATE + INTERVAL '30 days'
                    ORDER BY i.product_id, i.clinic_id, i.updated_at DESC
                ) i_all
                JOIN (
                    SELECT
                        product_id,
                        clinic_id,
                        SUM(quantity_on_hand) as quantity_on_hand
                    FROM inventory
                    WHERE clinic_id = @ClinicId
                    AND expiration_date IS NOT NULL
                    AND expiration_date <= CURRENT_DATE + INTERVAL '30 days'
                    GROUP BY product_id, clinic_id
                ) sums
                ON i_all.product_id = sums.product_id AND i_all.clinic_id = sums.clinic_id;";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<Inventory>(sql, new { ClinicId = clinicId });
        }

        public async Task<IEnumerable<Inventory>> GetProductsExpiringWithin3MonthsAsync(Guid? clinicId = null)
        {
            var whereClause = "i.expiration_date IS NOT NULL " +
                             "AND i.expiration_date >= CURRENT_DATE " +
                             "AND i.expiration_date <= CURRENT_DATE + INTERVAL '3 months'";
            
            if (clinicId.HasValue)
            {
                whereClause += " AND i.clinic_id = @ClinicId";
            }

            var sql = $@"
                SELECT i.*
                FROM inventory i
                WHERE {whereClause}
                ORDER BY i.expiration_date ASC, i.clinic_id, i.product_id";

            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<Inventory>(sql, new { ClinicId = clinicId });
        }

        public async Task<Inventory> CreateAsync(Inventory inventory)
        {
            const string sql = @"INSERT INTO inventory (clinic_id, product_id, quantity_on_hand, reorder_level, unit_price, supplier_id, last_restock_date, expiry_date, batch_number, location, notes, created_at, updated_at)
                VALUES (@ClinicId, @ProductId, @QuantityOnHand, @ReorderLevel, @UnitPrice, @SupplierId, @LastRestockDate, @ExpiryDate, @BatchNumber, @Location, @Notes, @CreatedAt, @UpdatedAt)
                RETURNING *;";
            using var connection = _dbContext.GetConnection();
            return await connection.QuerySingleAsync<Inventory>(sql, inventory);
        }

        public async Task<Inventory> UpdateAsync(Inventory inventory)
        {
            const string sql = @"
                UPDATE inventory SET
                clinic_id = @ClinicId,
                product_id = @ProductId,
                    lot_number = @LotNumber,
                    batch_number = @BatchNumber,
                    expiration_date = @ExpirationDate,
                    date_of_manufacture = @DateOfManufacture,
                quantity_on_hand = @QuantityOnHand,
                    quantity_reserved = @QuantityReserved,
                reorder_level = @ReorderLevel,
                    reorder_quantity = @ReorderQuantity,
                    unit_cost = @UnitCost,
                    wholesale_cost = @WholesaleCost,
                    retail_price = @RetailPrice,
                    unit_of_measure = @UnitOfMeasure,
                    units_per_package = @UnitsPerPackage,
                location = @Location,       
                    received_from_po = @ReceivedFromPo,
                    po_item_id = @PoItemId,
                    received_date = @ReceivedDate,
                    supplier_id = @SupplierId,
                updated_at = @UpdatedAt
                WHERE id = @Id
                RETURNING *;";
            using var connection = _dbContext.GetConnection();
            var updated = await connection.QuerySingleOrDefaultAsync<Inventory>(sql, inventory);
            if (updated == null)
                throw new KeyNotFoundException($"Inventory with ID {inventory.Id} not found");
            return updated;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM inventory WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
            return rowsAffected > 0;
        }

        public async Task AddAsync(Inventory inventory)
        {
            try
            {
                const string sql = @"
                    INSERT INTO inventory (
                    clinic_id, 
                    product_id, 
                        lot_number,
                        batch_number,
                        expiration_date,
                        date_of_manufacture,
                    quantity_on_hand, 
                        quantity_reserved,
                    reorder_level, 
                        reorder_quantity,
                        unit_cost,
                        wholesale_cost,
                        retail_price,
                        unit_of_measure,
                        units_per_package,
                    location, 
                        received_from_po,
                        po_item_id,
                        received_date,
                        supplier_id,
                    created_at, 
                    updated_at
                ) VALUES (
                    @ClinicId, 
                    @ProductId, 
                        @LotNumber,
                        @BatchNumber,
                        @ExpirationDate,
                        @DateOfManufacture,
                    @QuantityOnHand, 
                        @QuantityReserved,
                    @ReorderLevel, 
                        @ReorderQuantity,
                        @UnitCost,
                        @WholesaleCost,
                        @RetailPrice,
                        @UnitOfMeasure,
                        @UnitsPerPackage,
                    @Location, 
                        @ReceivedFromPo,
                        @PoItemId,
                        @ReceivedDate,
                        @SupplierId,
                    @CreatedAt, 
                    @UpdatedAt
                );";

                using var connection = _dbContext.GetConnection();
                await connection.ExecuteAsync(sql, inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddAsync");
                throw new InvalidOperationException("Failed to add inventory item", ex);
            }
        }

        // New methods for PO receiving inventory management
        public async Task<Inventory?> GetByProductAndBatchAsync(Guid productId, Guid clinicId, string? lotNumber, string? batchNumber)
        {
            const string sql = @"
                SELECT
                    i_all.*,
                    sums.quantity_on_hand
                FROM (
                    SELECT DISTINCT ON (i.product_id, i.clinic_id)
                        i.*
                    FROM inventory i
                    WHERE i.product_id = @ProductId
                    AND i.clinic_id = @ClinicId
                    AND (@LotNumber IS NULL OR i.lot_number = @LotNumber)
                    AND (@BatchNumber IS NULL OR i.batch_number = @BatchNumber)
                    ORDER BY i.product_id, i.clinic_id, i.updated_at DESC
                ) i_all
                JOIN (
                    SELECT
                        product_id,
                        clinic_id,
                        SUM(quantity_on_hand) as quantity_on_hand
                    FROM inventory
                    WHERE product_id = @ProductId
                    AND clinic_id = @ClinicId
                    AND (@LotNumber IS NULL OR lot_number = @LotNumber)
                    AND (@BatchNumber IS NULL OR batch_number = @BatchNumber)
                    GROUP BY product_id, clinic_id
                ) sums
                ON i_all.product_id = sums.product_id AND i_all.clinic_id = sums.clinic_id
                LIMIT 1;";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<Inventory>(sql, new { 
                ProductId = productId, 
                ClinicId = clinicId, 
                LotNumber = lotNumber, 
                BatchNumber = batchNumber 
            });
        }

        public async Task<Inventory?> GetByPoItemAsync(Guid poItemId)
        {
            const string sql = @"
                SELECT i.*, p.name as product_name 
                FROM inventory i
                LEFT JOIN products p ON i.product_id = p.id
                WHERE i.po_item_id = @PoItemId;";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<Inventory>(sql, new { PoItemId = poItemId });
        }

        public async Task<IEnumerable<Inventory>> GetByProductAndBatchRangeAsync(Guid productId, Guid clinicId, string? lotNumber = null, string? batchNumber = null)
        {
            const string sql = @"
                SELECT *
                FROM inventory i
                WHERE i.product_id = @ProductId
                AND i.clinic_id = @ClinicId
                AND (@LotNumber IS NULL OR i.lot_number = @LotNumber)
                AND (@BatchNumber IS NULL OR i.batch_number = @BatchNumber)
                ORDER BY i.updated_at DESC;";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<Inventory>(sql, new {
                ProductId = productId,
                ClinicId = clinicId,
                LotNumber = lotNumber,
                BatchNumber = batchNumber
            });
        }

        public async Task<IEnumerable<Inventory>> SearchProductsByTypeAheadAsync(Guid clinicId, string searchTerm, int limit = 10)
        {
            const string sql = @"
                SELECT DISTINCT ON (i.product_id)
                    i.*,
                    p.name as product_name,
                    p.product_number,
                    p.generic_name,
                    p.category
                FROM inventory i
                LEFT JOIN products p ON i.product_id = p.id
                WHERE i.clinic_id = @ClinicId
                AND (
                    p.name ILIKE @SearchTerm 
                    OR p.product_number ILIKE @SearchTerm
                    OR p.generic_name ILIKE @SearchTerm
                    OR p.category ILIKE @SearchTerm
                )
                AND p.is_active = true
                ORDER BY i.product_id, i.updated_at DESC
                LIMIT @Limit;";
            
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<Inventory>(sql, new { 
                ClinicId = clinicId, 
                SearchTerm = $"%{searchTerm}%",
                Limit = limit 
            });
        }

        public async Task<IEnumerable<Inventory>> SearchProductsByClinicAsync(Guid clinicId, string searchTerm)
        {
            const string sql = @"
                SELECT
                    porh.id AS Id,
                    porh.product_id AS ProductId,
                    porh.clinic_id AS ClinicId,
                    porh.quantity_on_hand AS QuantityOnHand,
                    0 AS QuantityReserved,
                    porh.batch_number AS BatchNumber,
                    porh.lot_number AS LotNumber,
                    porh.expiry_date AS ExpirationDate,
                    porh.date_of_manufacture AS DateOfManufacture,
                    porh.unit_cost AS UnitCost,
                    porh.unit_cost AS WholesaleCost,
                    porh.unit_cost AS RetailPrice,
                    porh.shelf AS Location,
                    p.unit_of_measure AS UnitOfMeasure,
                    1 AS UnitsPerPackage,
                    true AS ReceivedFromPo,
                    porh.purchase_order_item_id AS PoItemId,
                    0 AS ReorderLevel,
                    0 AS ReorderQuantity,
                    porh.barcode AS Barcode,
                    porh.notes AS Notes,
                    porh.created_at AS CreatedAt,
                    porh.updated_at AS UpdatedAt,
                    p.name as product_name,
                    p.product_number,
                    p.generic_name,
                    p.category
                FROM purchase_order_receiving_history porh
                LEFT JOIN products p ON porh.product_id = p.id
                WHERE porh.clinic_id = @ClinicId
                AND porh.quantity_on_hand > 0
                AND (
                    p.name ILIKE @SearchTerm
                    OR p.product_number ILIKE @SearchTerm
                    OR p.generic_name ILIKE @SearchTerm
                    OR p.category ILIKE @SearchTerm
                    OR porh.batch_number ILIKE @SearchTerm
                    OR porh.lot_number ILIKE @SearchTerm
                )
                AND p.is_active = true
                ORDER BY porh.batch_number, porh.lot_number, porh.updated_at DESC;";

            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<Inventory>(sql, new {
                ClinicId = clinicId,
                SearchTerm = $"%{searchTerm}%"
            });
        }
    }
}