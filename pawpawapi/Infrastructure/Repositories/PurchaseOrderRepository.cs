using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;

namespace Infrastructure.Repositories
{
    public class PurchaseOrderRepository : IPurchaseOrderRepository
    {
        private readonly DapperDbContext _dbContext;

        public PurchaseOrderRepository(DapperDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<PurchaseOrder?> GetByIdAsync(Guid id)
        {
            const string sql = "SELECT * FROM purchase_orders WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<PurchaseOrder>(sql, new { Id = id });
        }

        public async Task<IEnumerable<PurchaseOrder>> GetAllAsync(
            Guid? clinicId = null, 
            DateTime? dateFrom = null, 
            DateTime? dateTo = null,
            Guid? supplierId = null,
            IEnumerable<string>? status = null,
            string? orderNumber = null,
            Guid? createdBy = null,
            DateTime? expectedDeliveryFrom = null,
            DateTime? expectedDeliveryTo = null,
            DateTime? actualDeliveryFrom = null,
            DateTime? actualDeliveryTo = null)
        {
            var sql = "SELECT * FROM purchase_orders WHERE 1=1";
            var parameters = new DynamicParameters();

            if (clinicId.HasValue)
            {
                sql += " AND clinic_id = @ClinicId";
                parameters.Add("@ClinicId", clinicId.Value);
            }

            if (dateFrom.HasValue)
            {
                sql += " AND order_date >= @DateFrom";
                parameters.Add("@DateFrom", dateFrom.Value);
            }

            if (dateTo.HasValue)
            {
                sql += " AND order_date <= @DateTo";
                parameters.Add("@DateTo", dateTo.Value);
            }

            if (supplierId.HasValue)
            {
                sql += " AND supplier_id = @SupplierId";
                parameters.Add("@SupplierId", supplierId.Value);
            }

            if (status != null && status.Any())
            {
                sql += " AND status = ANY(@Status)";
                parameters.Add("@Status", status.ToArray());
            }

            if (!string.IsNullOrEmpty(orderNumber))
            {
                sql += " AND order_number ILIKE @OrderNumber";
                parameters.Add("@OrderNumber", $"%{orderNumber}%");
            }

            if (createdBy.HasValue)
            {
                sql += " AND created_by = @CreatedBy";
                parameters.Add("@CreatedBy", createdBy.Value);
            }

            if (expectedDeliveryFrom.HasValue)
            {
                sql += " AND expected_delivery_date >= @ExpectedDeliveryFrom";
                parameters.Add("@ExpectedDeliveryFrom", expectedDeliveryFrom.Value);
            }

            if (expectedDeliveryTo.HasValue)
            {
                sql += " AND expected_delivery_date <= @ExpectedDeliveryTo";
                parameters.Add("@ExpectedDeliveryTo", expectedDeliveryTo.Value);
            }

            if (actualDeliveryFrom.HasValue)
            {
                sql += " AND actual_delivery_date >= @ActualDeliveryFrom";
                parameters.Add("@ActualDeliveryFrom", actualDeliveryFrom.Value);
            }

            if (actualDeliveryTo.HasValue)
            {
                sql += " AND actual_delivery_date <= @ActualDeliveryTo";
                parameters.Add("@ActualDeliveryTo", actualDeliveryTo.Value);
            }

            sql += " ORDER BY created_at DESC";

            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<PurchaseOrder>(sql, parameters);
        }


        public async Task<PaginatedResponse<PurchaseOrder>> GetAllPagedAsync(
        Guid? clinicId = null,
        DateTime? dateFrom = null,
        DateTime? dateTo = null,
        Guid? supplierId = null,
        IEnumerable<string>? status = null,
        string? orderNumber = null,
        Guid? createdBy = null,
        DateTime? expectedDeliveryFrom = null,
        DateTime? expectedDeliveryTo = null,
        DateTime? actualDeliveryFrom = null,
        DateTime? actualDeliveryTo = null,
        int page = 1,
        int pageSize = 10)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize <= 0 ? 10 : pageSize;

            var whereSql = "FROM purchase_orders WHERE 1=1";
            var parameters = new DynamicParameters();

            if (clinicId.HasValue) { whereSql += " AND clinic_id = @ClinicId"; parameters.Add("@ClinicId", clinicId.Value); }
            if (dateFrom.HasValue) { whereSql += " AND order_date >= @DateFrom"; parameters.Add("@DateFrom", dateFrom.Value); }
            if (dateTo.HasValue) { whereSql += " AND order_date <= @DateTo"; parameters.Add("@DateTo", dateTo.Value); }
            if (supplierId.HasValue) { whereSql += " AND supplier_id = @SupplierId"; parameters.Add("@SupplierId", supplierId.Value); }
            if (status != null && status.Any()) { whereSql += " AND status = ANY(@Status)"; parameters.Add("@Status", status.ToArray()); }
            if (!string.IsNullOrEmpty(orderNumber)) { whereSql += " AND order_number ILIKE @OrderNumber"; parameters.Add("@OrderNumber", $"%{orderNumber}%"); }
            if (createdBy.HasValue) { whereSql += " AND created_by = @CreatedBy"; parameters.Add("@CreatedBy", createdBy.Value); }
            if (expectedDeliveryFrom.HasValue) { whereSql += " AND expected_delivery_date >= @ExpectedDeliveryFrom"; parameters.Add("@ExpectedDeliveryFrom", expectedDeliveryFrom.Value); }
            if (expectedDeliveryTo.HasValue) { whereSql += " AND expected_delivery_date <= @ExpectedDeliveryTo"; parameters.Add("@ExpectedDeliveryTo", expectedDeliveryTo.Value); }
            if (actualDeliveryFrom.HasValue) { whereSql += " AND actual_delivery_date >= @ActualDeliveryFrom"; parameters.Add("@ActualDeliveryFrom", actualDeliveryFrom.Value); }
            if (actualDeliveryTo.HasValue) { whereSql += " AND actual_delivery_date <= @ActualDeliveryTo"; parameters.Add("@ActualDeliveryTo", actualDeliveryTo.Value); }

            var countSql = $"SELECT COUNT(*) {whereSql}";
            var dataSql = $"SELECT * {whereSql} ORDER BY created_at DESC LIMIT @PageSize OFFSET @Offset";

            var offset = (page - 1) * pageSize;
            parameters.Add("@PageSize", pageSize);
            parameters.Add("@Offset", offset);

            using var connection = _dbContext.GetConnection();
            var totalItems = await connection.ExecuteScalarAsync<int>(countSql, parameters);
            var items = await connection.QueryAsync<PurchaseOrder>(dataSql, parameters);

            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);
            if (totalPages == 0) totalPages = 1;

            return new PaginatedResponse<PurchaseOrder>
            {
                Data = items,
                Meta = new PaginationMeta
                {
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalItems = totalItems,
                    TotalPages = totalPages
                }
            };
        }

        public async Task AddAsync(PurchaseOrder purchaseOrder)
        {
            const string sql = @"
        INSERT INTO purchase_orders (
            id, clinic_id, supplier_id, order_number, order_date, expected_delivery_date, 
            status, discount_percentage, discounted_amount, extended_amount, 
            total_amount, notes, created_by, created_at, updated_at, pdf_data
        )
        VALUES (
            @Id, @ClinicId, @SupplierId, @OrderNumber, @OrderDate, @ExpectedDeliveryDate, 
            @Status, @DiscountPercentage, @DiscountedAmount, @ExtendedAmount, 
            @TotalAmount, @Notes, @CreatedBy, @CreatedAt, @UpdatedAt, @PdfData
        );";

            try
            {
                using var connection = _dbContext.GetConnection();
                await connection.ExecuteAsync(sql, purchaseOrder);
            }
            catch (Exception ex)
            {
                // Optional: log the error
                Console.WriteLine($"Error inserting purchase order: {ex.Message}");
                // You could log it with a logge
            }
        }


        public async Task UpdateAsync(PurchaseOrder purchaseOrder)
        {
            const string sql = @"UPDATE purchase_orders SET
                clinic_id = @ClinicId,
                supplier_id = @SupplierId,
                order_number = @OrderNumber,
                order_date = @OrderDate,
                expected_delivery_date = @ExpectedDeliveryDate,
                actual_delivery_date = @ActualDeliveryDate,
                status = @Status,
                discount_percentage = @DiscountPercentage,
                discounted_amount = @DiscountedAmount,
                extended_amount = @ExtendedAmount,
                total_amount = @TotalAmount,
                notes = @Notes,
                created_by = @CreatedBy,
                created_at = @CreatedAt,
                updated_at = @UpdatedAt,
                pdf_data = @PdfData
                WHERE id = @Id;";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, purchaseOrder);
        }

        public async Task DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM purchase_orders WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, new { Id = id });
        }

        public async Task<string> GenerateOrderNumberAsync()
        {
            const string sql = "SELECT COUNT(*) FROM purchase_orders WHERE DATE(created_at) = CURRENT_DATE";
            using var connection = _dbContext.GetConnection();
            var count = await connection.ExecuteScalarAsync<int>(sql);
            var today = DateTime.Now.ToString("yyyyMMdd");
            return $"PO{today}{count + 1:D4}";
        }

        public async Task<PurchaseOrder?> GetByOrderNumberAsync(string orderNumber)
        {
            const string sql = "SELECT * FROM purchase_orders WHERE order_number = @OrderNumber";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<PurchaseOrder>(sql, new { OrderNumber = orderNumber });
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPendingReceivingAsync()
        {
            const string sql = "SELECT * FROM purchase_orders WHERE status IN ('ordered', 'partial') ORDER BY created_at DESC";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<PurchaseOrder>(sql);
        }
    }
} 