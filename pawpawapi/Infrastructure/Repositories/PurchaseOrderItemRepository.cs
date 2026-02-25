using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;

namespace Infrastructure.Repositories
{
    public class PurchaseOrderItemRepository : IPurchaseOrderItemRepository
    {
        private readonly DapperDbContext _dbContext;

        public PurchaseOrderItemRepository(DapperDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<PurchaseOrderItem?> GetByIdAsync(Guid id)
        {
            const string sql = "SELECT * FROM purchase_order_items WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<PurchaseOrderItem>(sql, new { Id = id });
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetAllAsync()
        {
            const string sql = "SELECT * FROM purchase_order_items ORDER BY created_at DESC";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<PurchaseOrderItem>(sql);
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetByPurchaseOrderIdAsync(Guid purchaseOrderId)
        {
            const string sql = "SELECT * FROM purchase_order_items WHERE purchase_order_id = @PurchaseOrderId ORDER BY created_at";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<PurchaseOrderItem>(sql, new { PurchaseOrderId = purchaseOrderId });
        }

        public async Task AddAsync(PurchaseOrderItem purchaseOrderItem)
        {
            const string sql = @"INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, discount_percentage, discounted_amount, extended_amount, tax_amount, total_amount, units_per_package, total_units, lot_number, batch_number,barcode_number, expiration_date, date_of_manufacture, actual_delivery_date, received_by, supplier_id, created_at, updated_at)
                VALUES (@Id, @PurchaseOrderId, @ProductId, @QuantityOrdered, @QuantityReceived, @UnitCost, @DiscountPercentage, @DiscountedAmount, @ExtendedAmount, @TaxAmount, @TotalAmount, @UnitsPerPackage, @TotalUnits, @LotNumber, @BatchNumber,@BarcodeNumber, @ExpirationDate, @DateOfManufacture, @ActualDeliveryDate, @ReceivedBy, @SupplierId, @CreatedAt, @UpdatedAt);";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, purchaseOrderItem);
        }

        public async Task UpdateAsync(PurchaseOrderItem purchaseOrderItem)
        {
            const string sql = @"UPDATE purchase_order_items SET
                purchase_order_id = @PurchaseOrderId,
                product_id = @ProductId,
                quantity_ordered = @QuantityOrdered,
                quantity_received = @QuantityReceived,
                unit_cost = @UnitCost,
                discount_percentage = @DiscountPercentage,
                discounted_amount = @DiscountedAmount,
                extended_amount = @ExtendedAmount,
                tax_amount = @TaxAmount,
                total_amount = @TotalAmount,
                units_per_package = @UnitsPerPackage,
                total_units = @TotalUnits,
                lot_number = @LotNumber,
                batch_number = @BatchNumber,
                barcode_number=@BarcodeNumber,
                expiration_date = @ExpirationDate,
                date_of_manufacture = @DateOfManufacture,
                actual_delivery_date = @ActualDeliveryDate,
                received_by = @ReceivedBy,
                supplier_id = @SupplierId,
                created_at = @CreatedAt,
                updated_at = @UpdatedAt
                WHERE id = @Id;";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, purchaseOrderItem);
        }

        public async Task DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM purchase_order_items WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, new { Id = id });
        }

        public async Task DeleteByPurchaseOrderIdAsync(Guid purchaseOrderId)
        {
            const string sql = "DELETE FROM purchase_order_items WHERE purchase_order_id = @PurchaseOrderId";
            using var connection = _dbContext.GetConnection();
            await connection.ExecuteAsync(sql, new { PurchaseOrderId = purchaseOrderId });
        }
    }
} 