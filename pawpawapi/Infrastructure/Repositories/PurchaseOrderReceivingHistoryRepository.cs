using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class PurchaseOrderReceivingHistoryRepository : IPurchaseOrderReceivingHistoryRepository
    {
        private readonly DapperDbContext _context;

        public PurchaseOrderReceivingHistoryRepository(DapperDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PurchaseOrderReceivingHistory>> GetAllAsync()
        {
            var sql = @"
                SELECT id AS Id, purchase_order_id AS PurchaseOrderId, purchase_order_item_id AS PurchaseOrderItemId,
                       product_id AS ProductId, clinic_id AS ClinicId, quantity_received AS QuantityReceived,
                       batch_number AS BatchNumber, expiry_date AS ExpiryDate, date_of_manufacture AS DateOfManufacture,
                       received_date AS ReceivedDate, received_by AS ReceivedBy, notes AS Notes,
                       unit_cost AS UnitCost, lot_number AS LotNumber, supplier_id AS SupplierId,
                       quantity_on_hand AS QuantityOnHand, barcode AS Barcode, barcode_number AS BarcodeNumber, shelf AS Shelf, bin AS Bin,
                       created_at AS CreatedAt, updated_at AS UpdatedAt
                FROM purchase_order_receiving_history
                ORDER BY expiry_date ASC NULLS LAST, received_date DESC, created_at DESC";
            using (var connection = await _context.CreateConnectionAsync())
            {
                return await connection.QueryAsync<PurchaseOrderReceivingHistory>(sql);
            }
        }

        public async Task<PurchaseOrderReceivingHistory> GetByIdAsync(Guid id)
        {
            var sql = @"
                SELECT id AS Id, purchase_order_id AS PurchaseOrderId, purchase_order_item_id AS PurchaseOrderItemId,
                       product_id AS ProductId, clinic_id AS ClinicId, quantity_received AS QuantityReceived,
                       batch_number AS BatchNumber, expiry_date AS ExpiryDate, date_of_manufacture AS DateOfManufacture,
                       received_date AS ReceivedDate, received_by AS ReceivedBy, notes AS Notes,
                       unit_cost AS UnitCost, lot_number AS LotNumber, supplier_id AS SupplierId,
                       quantity_on_hand AS QuantityOnHand, barcode AS Barcode, barcode_number AS BarcodeNumber, shelf AS Shelf, bin AS Bin,
                       created_at AS CreatedAt, updated_at AS UpdatedAt
                FROM purchase_order_receiving_history
                WHERE id = @Id and quantity_on_hand > 0";
            using (var connection = await _context.CreateConnectionAsync())
            {
                return await connection.QuerySingleOrDefaultAsync<PurchaseOrderReceivingHistory>(sql, new { Id = id });
            }
        }

        public async Task<IEnumerable<PurchaseOrderReceivingHistory>> GetByPurchaseOrderIdAsync(Guid purchaseOrderId)
        {
            var sql = @"
                SELECT id AS Id, purchase_order_id AS PurchaseOrderId, purchase_order_item_id AS PurchaseOrderItemId,
                       product_id AS ProductId, clinic_id AS ClinicId, quantity_received AS QuantityReceived,
                       batch_number AS BatchNumber, expiry_date AS ExpiryDate, date_of_manufacture AS DateOfManufacture,
                       received_date AS ReceivedDate, received_by AS ReceivedBy, notes AS Notes,
                       unit_cost AS UnitCost, lot_number AS LotNumber, supplier_id AS SupplierId,
                       quantity_on_hand AS QuantityOnHand, barcode AS Barcode, barcode_number AS BarcodeNumber, shelf AS Shelf, bin AS Bin,
                       created_at AS CreatedAt, updated_at AS UpdatedAt
                FROM purchase_order_receiving_history
                WHERE purchase_order_id = @PurchaseOrderId
                ORDER BY expiry_date ASC NULLS LAST, received_date DESC, created_at DESC";
            using (var connection = await _context.CreateConnectionAsync())
            {
                return await connection.QueryAsync<PurchaseOrderReceivingHistory>(sql, new { PurchaseOrderId = purchaseOrderId });
            }
        }

        public async Task<IEnumerable<PurchaseOrderReceivingHistory>> GetByProductIdAsync(Guid productId)
        {
            var sql = @"
                SELECT id AS Id, purchase_order_id AS PurchaseOrderId, purchase_order_item_id AS PurchaseOrderItemId,
                       product_id AS ProductId, clinic_id AS ClinicId, quantity_received AS QuantityReceived,
                       batch_number AS BatchNumber, expiry_date AS ExpiryDate, date_of_manufacture AS DateOfManufacture,
                       received_date AS ReceivedDate, received_by AS ReceivedBy, notes AS Notes,
                       unit_cost AS UnitCost, lot_number AS LotNumber, supplier_id AS SupplierId,
                       quantity_on_hand AS QuantityOnHand, barcode AS Barcode, barcode_number AS BarcodeNumber, shelf AS Shelf, bin AS Bin,
                       created_at AS CreatedAt, updated_at AS UpdatedAt
                FROM purchase_order_receiving_history
                WHERE product_id = @ProductId
                ORDER BY expiry_date ASC NULLS LAST, received_date DESC, created_at DESC";
            using (var connection = await _context.CreateConnectionAsync())
            {
                return await connection.QueryAsync<PurchaseOrderReceivingHistory>(sql, new { ProductId = productId });
            }
        }

        public async Task<IEnumerable<PurchaseOrderReceivingHistory>> GetByClinicIdAsync(Guid clinicId, string? productName = null, Guid? companyId = null)
        {
            var sql = @"
                SELECT porh.id AS Id, porh.purchase_order_id AS PurchaseOrderId, porh.purchase_order_item_id AS PurchaseOrderItemId,
       porh.product_id AS ProductId, porh.clinic_id AS ClinicId, porh.quantity_received AS QuantityReceived,
       porh.batch_number AS BatchNumber,porh.barcode_number AS BarcodeNumber, porh.expiry_date AS ExpiryDate, porh.date_of_manufacture AS DateOfManufacture,
       porh.received_date AS ReceivedDate, porh.received_by AS ReceivedBy, porh.notes AS Notes,
       porh.unit_cost AS UnitCost, porh.lot_number AS LotNumber, porh.supplier_id AS SupplierId,
                       porh.quantity_on_hand AS QuantityOnHand, porh.barcode AS Barcode, porh.shelf AS Shelf, porh.bin AS Bin,
                       c.company_id AS CompanyId,
       porh.created_at AS CreatedAt, porh.updated_at AS UpdatedAt
FROM purchase_order_receiving_history porh
                LEFT JOIN products p ON porh.product_id = p.id
                LEFT JOIN clinics c ON porh.clinic_id = c.id
                WHERE porh.clinic_id = @ClinicId AND porh.quantity_on_hand > 0";

            if (!string.IsNullOrWhiteSpace(productName))
            {
                sql += " AND p.name ILIKE @ProductName";
            }

            if (companyId.HasValue)
            {
                sql += " AND c.company_id = @CompanyId";
            }

            sql += " ORDER BY porh.received_date DESC, porh.created_at DESC";

            using (var connection = await _context.CreateConnectionAsync())
            {
                var parameters = new { ClinicId = clinicId, ProductName = $"%{productName}%", CompanyId = companyId };
                return await connection.QueryAsync<PurchaseOrderReceivingHistory>(sql, parameters);
            }
        }

        public async Task<IEnumerable<PurchaseOrderReceivingHistory>> GetByProductAndClinicAsync(Guid productId, Guid clinicId)
        {
            var sql = @"
                SELECT id AS Id, purchase_order_id AS PurchaseOrderId, purchase_order_item_id AS PurchaseOrderItemId,
                       product_id AS ProductId, clinic_id AS ClinicId, quantity_received AS QuantityReceived,
                       batch_number AS BatchNumber, expiry_date AS ExpiryDate, date_of_manufacture AS DateOfManufacture,
                       received_date AS ReceivedDate, received_by AS ReceivedBy, notes AS Notes,
                       unit_cost AS UnitCost, lot_number AS LotNumber, supplier_id AS SupplierId,
                       quantity_on_hand AS QuantityOnHand, barcode AS Barcode, barcode_number AS BarcodeNumber, shelf AS Shelf, bin AS Bin,
                       created_at AS CreatedAt, updated_at AS UpdatedAt
                FROM purchase_order_receiving_history
                WHERE product_id = @ProductId AND clinic_id = @ClinicId
                ORDER BY expiry_date ASC NULLS LAST, received_date DESC, created_at DESC";

            Console.WriteLine($"Executing SQL query for product {productId} and clinic {clinicId}");
            Console.WriteLine($"SQL: {sql}");

            using (var connection = await _context.CreateConnectionAsync())
            {
                var result = await connection.QueryAsync<PurchaseOrderReceivingHistory>(sql, new { ProductId = productId, ClinicId = clinicId });
                Console.WriteLine($"Query returned {result?.Count() ?? 0} records");
                return result;
            }
        }

        public async Task<PurchaseOrderReceivingHistory?> GetByProductAndBatchAsync(Guid productId, Guid clinicId, string batchNumber)
        {
            var sql = @"
                SELECT id AS Id, purchase_order_id AS PurchaseOrderId, purchase_order_item_id AS PurchaseOrderItemId,
                       product_id AS ProductId, clinic_id AS ClinicId, quantity_received AS QuantityReceived,
                       batch_number AS BatchNumber, expiry_date AS ExpiryDate, date_of_manufacture AS DateOfManufacture,
                       received_date AS ReceivedDate, received_by AS ReceivedBy, notes AS Notes,
                       unit_cost AS UnitCost, lot_number AS LotNumber, supplier_id AS SupplierId,
                       quantity_on_hand AS QuantityOnHand, barcode AS Barcode, barcode_number AS BarcodeNumber, shelf AS Shelf, bin AS Bin,
                       created_at AS CreatedAt, updated_at AS UpdatedAt
                FROM purchase_order_receiving_history
                WHERE product_id = @ProductId AND clinic_id = @ClinicId AND batch_number = @BatchNumber
                LIMIT 1";
            using (var connection = await _context.CreateConnectionAsync())
            {
                return await connection.QueryFirstOrDefaultAsync<PurchaseOrderReceivingHistory>(sql,
                    new { ProductId = productId, ClinicId = clinicId, BatchNumber = batchNumber });
            }
        }

        public async Task<PurchaseOrderReceivingHistory> GetByBarcodeAsync(string barcode)
        {
            var sql = @"
                SELECT id AS Id, purchase_order_id AS PurchaseOrderId, purchase_order_item_id AS PurchaseOrderItemId,
                       product_id AS ProductId, clinic_id AS ClinicId, quantity_received AS QuantityReceived,
                       batch_number AS BatchNumber, expiry_date AS ExpiryDate, date_of_manufacture AS DateOfManufacture,
                       received_date AS ReceivedDate, received_by AS ReceivedBy, notes AS Notes,
                       unit_cost AS UnitCost, lot_number AS LotNumber, supplier_id AS SupplierId,
                       quantity_on_hand AS QuantityOnHand, barcode AS Barcode, barcode_number AS BarcodeNumber, shelf AS Shelf, bin AS Bin,
                       created_at AS CreatedAt, updated_at AS UpdatedAt
                FROM purchase_order_receiving_history
                WHERE barcode = @Barcode";
            using (var connection = await _context.CreateConnectionAsync())
            {
                return await connection.QuerySingleOrDefaultAsync<PurchaseOrderReceivingHistory>(sql, new { Barcode = barcode });
            }
        }

        public async Task<PurchaseOrderReceivingHistory> AddAsync(PurchaseOrderReceivingHistory history)
        {
            var sql = @"
                INSERT INTO purchase_order_receiving_history (
                    id, purchase_order_id, purchase_order_item_id, product_id, clinic_id, quantity_received,
                    batch_number, expiry_date, date_of_manufacture, received_date, received_by, notes,
                    unit_cost, lot_number, supplier_id, quantity_on_hand, barcode, barcode_number, shelf, bin, created_at, updated_at
                ) VALUES (
                    @Id, @PurchaseOrderId, @PurchaseOrderItemId, @ProductId, @ClinicId, @QuantityReceived,
                    @BatchNumber, @ExpiryDate, @DateOfManufacture, @ReceivedDate, @ReceivedBy, @Notes,
                    @UnitCost, @LotNumber, @SupplierId, @QuantityOnHand, @Barcode, @BarcodeNumber, @Shelf, @Bin, @CreatedAt, @UpdatedAt
                ) RETURNING id AS Id, purchase_order_id AS PurchaseOrderId, purchase_order_item_id AS PurchaseOrderItemId,
                       product_id AS ProductId, clinic_id AS ClinicId, quantity_received AS QuantityReceived,
                       batch_number AS BatchNumber, expiry_date AS ExpiryDate, date_of_manufacture AS DateOfManufacture,
                       received_date AS ReceivedDate, received_by AS ReceivedBy, notes AS Notes,
                       unit_cost AS UnitCost, lot_number AS LotNumber, supplier_id AS SupplierId,
                       quantity_on_hand AS QuantityOnHand, barcode AS Barcode, barcode_number AS BarcodeNumber, shelf AS Shelf, bin AS Bin,
                       created_at AS CreatedAt, updated_at AS UpdatedAt";
            using (var connection = await _context.CreateConnectionAsync())
            {
                return await connection.QuerySingleAsync<PurchaseOrderReceivingHistory>(sql, history);
            }
        }

        public async Task<PurchaseOrderReceivingHistory> UpdateAsync(PurchaseOrderReceivingHistory history)
        {
            var sql = @"
                UPDATE purchase_order_receiving_history 
                SET purchase_order_id = @PurchaseOrderId, purchase_order_item_id = @PurchaseOrderItemId,
                    product_id = @ProductId, clinic_id = @ClinicId, quantity_received = @QuantityReceived,
                    batch_number = @BatchNumber, expiry_date = @ExpiryDate, date_of_manufacture = @DateOfManufacture,
                    received_date = @ReceivedDate, received_by = @ReceivedBy, notes = @Notes,
                    unit_cost = @UnitCost, lot_number = @LotNumber, supplier_id = @SupplierId,
                    quantity_on_hand = @QuantityOnHand, barcode = @Barcode, barcode_number = @BarcodeNumber, shelf = @Shelf, bin = @Bin, updated_at = @UpdatedAt
                WHERE id = @Id
                RETURNING id AS Id, purchase_order_id AS PurchaseOrderId, purchase_order_item_id AS PurchaseOrderItemId,
                       product_id AS ProductId, clinic_id AS ClinicId, quantity_received AS QuantityReceived,
                       batch_number AS BatchNumber, expiry_date AS ExpiryDate, date_of_manufacture AS DateOfManufacture,
                       received_date AS ReceivedDate, received_by AS ReceivedBy, notes AS Notes,
                       unit_cost AS UnitCost, lot_number AS LotNumber, supplier_id AS SupplierId,
                       quantity_on_hand AS QuantityOnHand, barcode AS Barcode, barcode_number AS BarcodeNumber, shelf AS Shelf, bin AS Bin,
                       created_at AS CreatedAt, updated_at AS UpdatedAt";
            using (var connection = await _context.CreateConnectionAsync())
            {
                return await connection.QuerySingleOrDefaultAsync<PurchaseOrderReceivingHistory>(sql, history);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var sql = "DELETE FROM purchase_order_receiving_history WHERE id = @Id";
            using (var connection = await _context.CreateConnectionAsync())
            {
                var affectedRows = await connection.ExecuteAsync(sql, new { Id = id });
                return affectedRows > 0;
            }
        }
    }
}
