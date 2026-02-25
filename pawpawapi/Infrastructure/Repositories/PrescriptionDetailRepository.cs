using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Linq;

namespace Infrastructure.Repositories
{
    public class PrescriptionDetailRepository : IPrescriptionDetailRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<PrescriptionDetailRepository> _logger;

        public PrescriptionDetailRepository(DapperDbContext dbContext, ILogger<PrescriptionDetailRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PrescriptionDetail> CreateAsync(PrescriptionDetail prescriptionDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    prescriptionDetail.Id = Guid.NewGuid();
                    prescriptionDetail.CreatedAt = DateTimeOffset.UtcNow;
                    prescriptionDetail.UpdatedAt = DateTimeOffset.UtcNow;

                    var parameters = new
                    {
                        prescriptionDetail.Id,
                        prescriptionDetail.VisitId,
                        prescriptionDetail.Notes,
                        prescriptionDetail.CreatedAt,
                        prescriptionDetail.UpdatedAt
                    };

                    var query = @"
INSERT INTO prescription_details 
(id, visit_id, notes, created_at, updated_at) 
VALUES 
(@Id, @VisitId, @Notes, @CreatedAt, @UpdatedAt) 
RETURNING 
    id AS Id,
    visit_id AS VisitId,
    notes AS Notes,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var createdPrescriptionDetail = await connection.QuerySingleAsync<PrescriptionDetail>(query, parameters, transaction);
                    transaction.Commit();
                    return createdPrescriptionDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync transaction");
                    throw new InvalidOperationException("Failed to create prescription detail", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create prescription detail", ex);
            }
        }

        public async Task<PrescriptionDetail> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pd.id AS Id,
    pd.visit_id AS VisitId,
    pd.notes AS Notes,
    pd.created_at AS CreatedAt,
    pd.updated_at AS UpdatedAt
FROM prescription_details pd
WHERE pd.id = @Id;";

                var prescriptionDetail = await connection.QuerySingleOrDefaultAsync<PrescriptionDetail>(query, new { Id = id });
                
                return prescriptionDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for prescription detail {PrescriptionDetailId}", id);
                throw new InvalidOperationException($"Failed to get prescription detail with id {id}", ex);
            }
        }

        public async Task<PrescriptionDetail> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT 
    pd.id AS Id,
    pd.visit_id AS VisitId,
    pd.notes AS Notes,
    pd.created_at AS CreatedAt,
    pd.updated_at AS UpdatedAt
FROM prescription_details pd
WHERE pd.visit_id = @VisitId
ORDER BY pd.created_at DESC;";

                var prescriptionDetails = await connection.QueryAsync<PrescriptionDetail>(query, new { VisitId = visitId });
                var prescriptionDetail = prescriptionDetails.FirstOrDefault();
                
                if (prescriptionDetail != null)
                {
                    prescriptionDetail.ProductMappings = await GetProductMappingsForPrescriptionDetailAsync(connection, prescriptionDetail.Id);
                }
                return prescriptionDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw new InvalidOperationException($"Failed to get prescription detail for visit {visitId}", ex);
            }
        }

        private async Task<ICollection<PrescriptionProductMapping>> GetProductMappingsForPrescriptionDetailAsync(IDbConnection connection, Guid prescriptionDetailId)
        {
            var query = @"
SELECT
    ppm.id AS Id,
    ppm.prescription_detail_id AS PrescriptionDetailId,
    ppm.product_id AS ProductId,
    ppm.is_checked AS IsChecked,
    ppm.quantity AS Quantity,
    ppm.frequency AS Frequency,
    ppm.directions AS Directions,
    ppm.number_of_days AS NumberOfDays,
    ppm.purchase_order_receiving_history_id AS PurchaseOrderReceivingHistoryId,
    ppm.created_at AS CreatedAt,
    ppm.updated_at AS UpdatedAt
FROM prescription_product_mapping ppm
WHERE ppm.prescription_detail_id = @PrescriptionDetailId;";

            var mappings = await connection.QueryAsync<PrescriptionProductMapping>(query, new { PrescriptionDetailId = prescriptionDetailId });
            return mappings.AsList();
        }

        public async Task<PrescriptionDetail> UpdateAsync(PrescriptionDetail prescriptionDetail)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    prescriptionDetail.UpdatedAt = DateTimeOffset.UtcNow;

                    var setClauses = new List<string>();
                    var parameters = new DynamicParameters();
                    parameters.Add("Id", prescriptionDetail.Id);

                    if (prescriptionDetail.Notes != null)
                    {
                        setClauses.Add("notes = @Notes");
                        parameters.Add("Notes", prescriptionDetail.Notes);
                    }

                    setClauses.Add("updated_at = @UpdatedAt");
                    parameters.Add("UpdatedAt", prescriptionDetail.UpdatedAt);

                    var setClause = string.Join(", ", setClauses);
                    var query = @"
UPDATE prescription_details
SET " + setClause + @"
WHERE id = @Id
RETURNING 
    id AS Id,
    visit_id AS VisitId,
    notes AS Notes,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt;";

                    var updatedPrescriptionDetail = await connection.QuerySingleAsync<PrescriptionDetail>(query, parameters, transaction);
                    updatedPrescriptionDetail.ProductMappings = await GetProductMappingsForPrescriptionDetailAsync(connection, updatedPrescriptionDetail.Id);
                    transaction.Commit();
                    return updatedPrescriptionDetail;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync transaction for prescription detail {PrescriptionDetailId}", prescriptionDetail.Id);
                    throw new InvalidOperationException($"Failed to update prescription detail with id {prescriptionDetail.Id}", ex);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for prescription detail {PrescriptionDetailId}", prescriptionDetail.Id);
                throw new InvalidOperationException($"Failed to update prescription detail with id {prescriptionDetail.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM prescription_details WHERE id = @Id;";
                var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for prescription detail {PrescriptionDetailId}", id);
                throw new InvalidOperationException($"Failed to delete prescription detail with id {id}", ex);
            }
        }

        public async Task<bool> AddProductMappingAsync(Guid prescriptionDetailId, PrescriptionProductMapping mapping)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    // Check if mapping already exists
                    var existingMappingQuery = @"
SELECT id, is_checked, quantity 
FROM prescription_product_mapping 
WHERE prescription_detail_id = @PrescriptionDetailId 
AND purchase_order_receiving_history_id = @PurchaseOrderReceivingHistoryId;";

                    var existingMapping = await connection.QuerySingleOrDefaultAsync(existingMappingQuery, 
                        new { PrescriptionDetailId = prescriptionDetailId, mapping.PurchaseOrderReceivingHistoryId }, transaction);

                    if (existingMapping != null)
                    {
                        // Update existing mapping
                        var updateQuery = @"
UPDATE prescription_product_mapping
SET is_checked = @IsChecked,
    quantity = @Quantity,
    frequency = @Frequency,
    directions = @Directions,
    number_of_days = @NumberOfDays,
    purchase_order_receiving_history_id = @PurchaseOrderReceivingHistoryId,
    updated_at = @UpdatedAt
WHERE prescription_detail_id = @PrescriptionDetailId
AND purchase_order_receiving_history_id = @PurchaseOrderReceivingHistoryId;";

                        var updateParameters = new
                        {
                            PrescriptionDetailId = prescriptionDetailId,
                            mapping.ProductId,
                            mapping.IsChecked,
                            mapping.Quantity,
                            mapping.Frequency,
                            mapping.Directions,
                            mapping.NumberOfDays,
                            mapping.PurchaseOrderReceivingHistoryId,
                            UpdatedAt = DateTimeOffset.UtcNow
                        };

                        var rowsAffected = await connection.ExecuteAsync(updateQuery, updateParameters, transaction);

                        // Handle inventory updates for checked items
                        /*if (mapping.IsChecked && mapping.Quantity.HasValue && mapping.Quantity.Value > 0)
                        {
                            // Check if this is a newly checked item or quantity changed
                            if (!existingMapping.is_checked)
                            {
                                _logger.LogInformation("Item newly checked - deducting inventory for product {ProductId}, PurchaseOrderReceivingHistoryId {HistoryId}, quantity {Quantity}",
                                    mapping.ProductId, mapping.PurchaseOrderReceivingHistoryId, mapping.Quantity);

                                await UpdateInventoryQuantitiesAsync(connection, transaction, mapping);
                            }
                            else if (mapping.Quantity.Value > existingMapping.quantity)
                            {
                                var quantityChange = mapping.Quantity.Value - existingMapping.quantity;
                                _logger.LogInformation("Quantity increased for checked item - deducting additional inventory for product {ProductId}, PurchaseOrderReceivingHistoryId {HistoryId}, additional quantity {QuantityChange}",
                                    (object)mapping.ProductId, (object)mapping.PurchaseOrderReceivingHistoryId, (object)quantityChange);

                                var additionalMapping = new PrescriptionProductMapping
                                {
                                    ProductId = mapping.ProductId,
                                    Quantity = quantityChange,
                                    PurchaseOrderReceivingHistoryId = mapping.PurchaseOrderReceivingHistoryId
                                };
                                await UpdateInventoryQuantitiesAsync(connection, transaction, additionalMapping);
                            }
                        }*/

                        transaction.Commit();
                        return rowsAffected > 0;
                    }
                    else
                    {
                        // Insert new mapping
                        var insertQuery = @"
INSERT INTO prescription_product_mapping
(id, prescription_detail_id, product_id, is_checked, quantity, frequency, directions, number_of_days, purchase_order_receiving_history_id, created_at, updated_at)
VALUES
(@Id, @PrescriptionDetailId, @ProductId, @IsChecked, @Quantity, @Frequency, @Directions, @NumberOfDays, @PurchaseOrderReceivingHistoryId, @CreatedAt, @UpdatedAt);";

                        var insertParameters = new
                        {
                            Id = Guid.NewGuid(),
                            PrescriptionDetailId = prescriptionDetailId,
                            mapping.ProductId,
                            mapping.IsChecked,
                            mapping.Quantity,
                            mapping.Frequency,
                            mapping.Directions,
                            mapping.NumberOfDays,
                            mapping.PurchaseOrderReceivingHistoryId,
                            CreatedAt = DateTimeOffset.UtcNow,
                            UpdatedAt = DateTimeOffset.UtcNow
                        };

                        var rowsAffected = await connection.ExecuteAsync(insertQuery, insertParameters, transaction);

                        //// If checkbox is true, update inventory and purchase order receiving history
                        //if (mapping.IsChecked && mapping.Quantity.HasValue && mapping.Quantity.Value > 0)
                        //{
                        //    await UpdateInventoryQuantitiesAsync(connection, transaction, mapping);
                        //}

                        transaction.Commit();
                        return rowsAffected > 0;
                    }
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in AddProductMappingAsync transaction");
                    throw;
                }
            }
            catch (InvalidOperationException)
            {
                // Re-throw InvalidOperationException with original message (e.g., insufficient quantity)
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddProductMappingAsync for prescription detail {PrescriptionDetailId}", prescriptionDetailId);
                throw new InvalidOperationException($"Failed to add product mapping for prescription detail {prescriptionDetailId}", ex);
            }
        }

        private async Task UpdateInventoryQuantitiesAsync(IDbConnection connection, IDbTransaction transaction, PrescriptionProductMapping mapping)
        {
            try
            {
                _logger.LogInformation("Starting inventory update for PurchaseOrderReceivingHistoryId {PurchaseOrderReceivingHistoryId}, quantity {Quantity}",
                    mapping.PurchaseOrderReceivingHistoryId, mapping.Quantity);

                if (!mapping.PurchaseOrderReceivingHistoryId.HasValue)
                {
                    throw new InvalidOperationException("PurchaseOrderReceivingHistoryId is required for inventory updates.");
                }

                // Get batch information from purchase order receiving history
                var getBatchInfoQuery = @"
SELECT batch_number, quantity_on_hand
FROM purchase_order_receiving_history
WHERE id = @PurchaseOrderReceivingHistoryId;";

                var batchInfo = await connection.QuerySingleOrDefaultAsync<(string BatchNumber, int QuantityOnHand)>(getBatchInfoQuery,
                    new { PurchaseOrderReceivingHistoryId = mapping.PurchaseOrderReceivingHistoryId.Value }, transaction);

                if (string.IsNullOrEmpty(batchInfo.BatchNumber))
                {
                    throw new InvalidOperationException($"Unable to find purchase order receiving history record. PurchaseOrderReceivingHistoryId: {mapping.PurchaseOrderReceivingHistoryId}");
                }

                var requiredQuantity = mapping.Quantity ?? 0;

                if (batchInfo.QuantityOnHand < requiredQuantity)
                {
                    throw new InvalidOperationException($"Unable to add prescription due to insufficient purchase order receiving history balance. PurchaseOrderReceivingHistoryId: {mapping.PurchaseOrderReceivingHistoryId}. Available quantity: {batchInfo.QuantityOnHand}, Required quantity: {requiredQuantity}. Please check purchase order receiving history levels or adjust the prescribed quantity.");
                }

                _logger.LogInformation("Purchase order receiving history validation passed. Available: {Available}, Required: {Required}",
                    batchInfo.QuantityOnHand, requiredQuantity);

                // Check inventory table
                var checkInventoryQuery = @"
SELECT quantity_on_hand
FROM inventory
WHERE product_id = @ProductId
AND batch_number = @BatchNumber;";

                var currentInventory = await connection.QuerySingleOrDefaultAsync<int?>(checkInventoryQuery,
                    new { mapping.ProductId, BatchNumber = batchInfo.BatchNumber }, transaction);

                _logger.LogInformation("Inventory validation - Product: {ProductId}, Batch: {BatchNumber}, Available: {Available}, Required: {Required}",
                    mapping.ProductId, batchInfo.BatchNumber, currentInventory ?? 0, requiredQuantity);

                if (!currentInventory.HasValue || currentInventory.Value < requiredQuantity)
                {
                    throw new InvalidOperationException($"Unable to add prescription due to insufficient inventory balance. Product ID: {mapping.ProductId}, Batch: {batchInfo.BatchNumber}. Available quantity: {currentInventory ?? 0}, Required quantity: {requiredQuantity}. Please check inventory levels or adjust the prescribed quantity.");
                }

                // Update inventory quantity
                var inventoryQuery = @"
UPDATE inventory
SET quantity_on_hand = quantity_on_hand - @Quantity,
    updated_at = @UpdatedAt
WHERE product_id = @ProductId
AND batch_number = @BatchNumber
AND quantity_on_hand >= @Quantity;";

                var inventoryParams = new
                {
                    Quantity = requiredQuantity,
                    mapping.ProductId,
                    BatchNumber = batchInfo.BatchNumber,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                var inventoryRowsAffected = await connection.ExecuteAsync(inventoryQuery, inventoryParams, transaction);
                if (inventoryRowsAffected == 0)
                {
                    throw new InvalidOperationException($"Unable to update prescription due to inventory update failure. Product ID: {mapping.ProductId}, Batch: {batchInfo.BatchNumber}. The inventory could not be updated, possibly due to concurrent modifications or insufficient quantity. Please try again.");
                }

                _logger.LogInformation("Successfully updated inventory for product {ProductId}, batch {BatchNumber}. Rows affected: {RowsAffected}",
                    mapping.ProductId, batchInfo.BatchNumber, inventoryRowsAffected);

                // Update purchase order receiving history quantity using the specific ID
                var poHistoryQuery = @"
UPDATE purchase_order_receiving_history
SET quantity_on_hand = quantity_on_hand - @Quantity,
    updated_at = @UpdatedAt
WHERE id = @PurchaseOrderReceivingHistoryId
AND quantity_on_hand >= @Quantity;";

                var poHistoryParams = new
                {
                    Quantity = requiredQuantity,
                    PurchaseOrderReceivingHistoryId = mapping.PurchaseOrderReceivingHistoryId.Value,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                var poHistoryRowsAffected = await connection.ExecuteAsync(poHistoryQuery, poHistoryParams, transaction);
                if (poHistoryRowsAffected == 0)
                {
                    throw new InvalidOperationException($"Unable to update prescription due to purchase order history update failure. PurchaseOrderReceivingHistoryId: {mapping.PurchaseOrderReceivingHistoryId}. The purchase order receiving history could not be updated, possibly due to concurrent modifications or insufficient quantity. Please try again.");
                }

                _logger.LogInformation("Successfully updated purchase order receiving history for product {ProductId}, batch {BatchNumber}. Rows affected: {RowsAffected}",
                    mapping.ProductId, batchInfo.BatchNumber, poHistoryRowsAffected);

                // Log the final quantities for verification
                var finalInventoryQuery = @"
SELECT quantity_on_hand
FROM inventory
WHERE product_id = @ProductId
AND batch_number = @BatchNumber;";

                var finalInventory = await connection.QuerySingleOrDefaultAsync<int?>(finalInventoryQuery,
                    new { mapping.ProductId, BatchNumber = batchInfo.BatchNumber }, transaction);

                var finalPoHistoryQuery = @"
SELECT quantity_on_hand
FROM purchase_order_receiving_history
WHERE id = @PurchaseOrderReceivingHistoryId;";

                var finalPoHistory = await connection.QuerySingleOrDefaultAsync<int?>(finalPoHistoryQuery,
                    new { PurchaseOrderReceivingHistoryId = mapping.PurchaseOrderReceivingHistoryId.Value }, transaction);

                _logger.LogInformation("Final quantities after update - Inventory: {FinalInventory}, PO History: {FinalPoHistory}",
                    finalInventory, finalPoHistory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inventory quantities for product {ProductId}, PurchaseOrderReceivingHistoryId {HistoryId}, quantity {Quantity}",
                    mapping.ProductId, mapping.PurchaseOrderReceivingHistoryId, mapping.Quantity);
                throw;
            }
        }

        private async Task RestoreInventoryQuantitiesAsync(IDbConnection connection, IDbTransaction transaction, PrescriptionProductMapping mapping)
        {
            try
            {
                _logger.LogInformation("Starting inventory restoration for PurchaseOrderReceivingHistoryId {PurchaseOrderReceivingHistoryId}, quantity {Quantity}",
                    mapping.PurchaseOrderReceivingHistoryId, mapping.Quantity);

                if (!mapping.PurchaseOrderReceivingHistoryId.HasValue)
                {
                    throw new InvalidOperationException("PurchaseOrderReceivingHistoryId is required for inventory restoration.");
                }

                // Get batch information from purchase order receiving history
                var getBatchInfoQuery = @"
SELECT batch_number
FROM purchase_order_receiving_history
WHERE id = @PurchaseOrderReceivingHistoryId;";

                var batchNumber = await connection.QuerySingleOrDefaultAsync<string>(getBatchInfoQuery,
                    new { PurchaseOrderReceivingHistoryId = mapping.PurchaseOrderReceivingHistoryId.Value }, transaction);

                if (string.IsNullOrEmpty(batchNumber))
                {
                    throw new InvalidOperationException($"Unable to find purchase order receiving history record. PurchaseOrderReceivingHistoryId: {mapping.PurchaseOrderReceivingHistoryId}");
                }

                // Restore inventory quantity
                var inventoryQuery = @"
UPDATE inventory
SET quantity_on_hand = quantity_on_hand + @Quantity,
    updated_at = @UpdatedAt
WHERE product_id = @ProductId
AND batch_number = @BatchNumber;";

                var inventoryParams = new
                {
                    mapping.Quantity,
                    mapping.ProductId,
                    BatchNumber = batchNumber,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                var inventoryRowsAffected = await connection.ExecuteAsync(inventoryQuery, inventoryParams, transaction);
                _logger.LogInformation("Restored inventory for product {ProductId}, batch {BatchNumber}. Rows affected: {RowsAffected}",
                    mapping.ProductId, batchNumber, inventoryRowsAffected);

                // Restore purchase order receiving history quantity
                var poHistoryQuery = @"
UPDATE purchase_order_receiving_history
SET quantity_on_hand = quantity_on_hand + @Quantity,
    updated_at = @UpdatedAt
WHERE id = @PurchaseOrderReceivingHistoryId;";

                var poHistoryParams = new
                {
                    mapping.Quantity,
                    PurchaseOrderReceivingHistoryId = mapping.PurchaseOrderReceivingHistoryId.Value,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                var poHistoryRowsAffected = await connection.ExecuteAsync(poHistoryQuery, poHistoryParams, transaction);
                _logger.LogInformation("Restored purchase order receiving history for product {ProductId}, batch {BatchNumber}. Rows affected: {RowsAffected}",
                    mapping.ProductId, batchNumber, poHistoryRowsAffected);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RestoreInventoryQuantitiesAsync for PurchaseOrderReceivingHistoryId {PurchaseOrderReceivingHistoryId}",
                    mapping.PurchaseOrderReceivingHistoryId);
                throw;
            }
        }

        public async Task<bool> RestoreInventoryForMappingAsync(PrescriptionProductMapping mapping)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();
                try
                {
                    await RestoreInventoryQuantitiesAsync(connection, transaction, mapping);
                    transaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in RestoreInventoryForMappingAsync transaction");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RestoreInventoryForMappingAsync for product {ProductId}", mapping.ProductId);
                throw new InvalidOperationException($"Failed to restore inventory for product {mapping.ProductId}", ex);
            }
        }

        public async Task<bool> RemoveProductMappingAsync(Guid prescriptionDetailId, Guid productId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = "DELETE FROM prescription_product_mapping WHERE prescription_detail_id = @PrescriptionDetailId AND product_id = @ProductId;";
                var rowsAffected = await connection.ExecuteAsync(query, new { PrescriptionDetailId = prescriptionDetailId, ProductId = productId });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RemoveProductMappingAsync for prescription detail {PrescriptionDetailId}", prescriptionDetailId);
                throw new InvalidOperationException($"Failed to remove product mapping for prescription detail {prescriptionDetailId}", ex);
            }
        }

        public async Task<ICollection<PrescriptionProductMapping>> GetProductMappingsAsync(Guid prescriptionDetailId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT
    ppm.id AS Id,
    ppm.prescription_detail_id AS PrescriptionDetailId,
    ppm.product_id AS ProductId,
    ppm.is_checked AS IsChecked,
    ppm.quantity AS Quantity,
    ppm.frequency AS Frequency,
    ppm.directions AS Directions,
    ppm.number_of_days AS NumberOfDays,
    ppm.purchase_order_receiving_history_id AS PurchaseOrderReceivingHistoryId,
    ppm.created_at AS CreatedAt,
    ppm.updated_at AS UpdatedAt
FROM prescription_product_mapping ppm
WHERE ppm.prescription_detail_id = @PrescriptionDetailId;";

                var mappings = await connection.QueryAsync<PrescriptionProductMapping>(query, new { PrescriptionDetailId = prescriptionDetailId });
                return mappings.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProductMappingsAsync for prescription detail {PrescriptionDetailId}", prescriptionDetailId);
                throw new InvalidOperationException($"Failed to get product mappings for prescription detail {prescriptionDetailId}", ex);
            }
        }

        public async Task<ICollection<PrescriptionProductMappingWithProduct>> GetProductMappingsWithProductAsync(Guid prescriptionDetailId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT
    ppm.id AS Id,
    ppm.prescription_detail_id AS PrescriptionDetailId,
    ppm.product_id AS ProductId,
    ppm.is_checked AS IsChecked,
    ppm.quantity AS Quantity,
    ppm.frequency AS Frequency,
    ppm.directions AS Directions,
    ppm.number_of_days AS NumberOfDays,
    ppm.purchase_order_receiving_history_id AS PurchaseOrderReceivingHistoryId,
    ppm.created_at AS CreatedAt,
    ppm.updated_at AS UpdatedAt,
    p.id AS Product_Id,
    p.product_number AS Product_ProductNumber,
    p.name AS Product_Name,
    p.generic_name AS Product_GenericName,
    p.category AS Product_Category,
    -- product_type removed
    p.brandname AS Product_Manufacturer,
    p.ndc_number AS Product_NdcNumber,
    COALESCE(p.generic_name, p.name) AS Product_Strength,
    p.dosage_form AS Product_DosageForm,
    p.unit_of_measure AS Product_UnitOfMeasure,
    p.requires_prescription AS Product_RequiresPrescription,
    p.controlled_substance_schedule AS Product_ControlledSubstanceSchedule,
    p.brandname AS Product_BrandName,
    p.storage_requirements AS Product_StorageRequirements,
    p.is_active AS Product_IsActive,
    p.price AS Product_Price,
    p.selling_price AS Product_SellingPrice
FROM prescription_product_mapping ppm
LEFT JOIN products p ON ppm.product_id = p.id
WHERE ppm.prescription_detail_id = @PrescriptionDetailId;";

                var mappings = await connection.QueryAsync<PrescriptionProductMappingWithProduct>(query, new { PrescriptionDetailId = prescriptionDetailId });
                return mappings.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProductMappingsWithProductAsync for prescription detail {PrescriptionDetailId}", prescriptionDetailId);
                throw new InvalidOperationException($"Failed to get product mappings with product details for prescription detail {prescriptionDetailId}", ex);
            }
        }

        public async Task<List<PrescriptionDetailFlatResult>> GetPrescriptionDetailsByPatientIdAsync(Guid patientId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                var query = @"
SELECT
    pd.id AS PrescriptionDetailId,
    pd.notes AS Notes,
    pd.created_at AS CreatedAt,
    pd.updated_at AS UpdatedAt,

    v.id AS VisitId,
    v.appointment_id AS AppointmentId,
    v.is_intake_completed AS IsIntakeCompleted,
    v.is_complaints_completed AS IsComplaintsCompleted,
    v.is_vitals_completed AS IsVitalsCompleted,
    v.is_plan_completed AS IsPlanCompleted,
    v.created_at AS VisitCreatedAt,
    v.updated_at AS VisitUpdatedAt,

    a.clinic_id AS ClinicId,
    a.patient_id AS PatientId,
    a.client_id AS ClientId,
    a.veterinarian_id AS VeterinarianId,
    u.first_name AS VeterinarianName,
    a.room_id AS RoomId,
    a.appointment_date AS AppointmentDate,
    a.room_slot_id AS RoomSlotId,
    at.name AS AppointmentType,
    a.reason AS Reason,
    a.status AS Status,
    a.notes AS AppointmentNotes,

    ppm.id AS ProductMappingId,
    ppm.product_id AS ProductId,
    ppm.is_checked AS IsChecked,
    ppm.quantity AS Quantity,
    ppm.frequency AS Frequency,
    ppm.directions AS Directions,
    ppm.number_of_days AS NumberOfDays,
    ppm.purchase_order_receiving_history_id AS PurchaseOrderReceivingHistoryId,
    ppm.created_at AS ProductMappingCreatedAt,
    ppm.updated_at AS ProductMappingUpdatedAt,

    p.id AS Product_Id,
    p.name AS Product_Name,
    p.generic_name AS Product_GenericName,
    p.category AS Product_Category,
    -- product_type removed
    p.ndc_number AS Product_NdcNumber,
    p.dosage_form AS Product_DosageForm,
    p.unit_of_measure AS Product_UnitOfMeasure,
    p.requires_prescription AS Product_RequiresPrescription,
    p.controlled_substance_schedule AS Product_ControlledSubstanceSchedule,
    p.storage_requirements AS Product_StorageRequirements,
    p.is_active AS Product_IsActive
FROM prescription_details pd
INNER JOIN visits v ON pd.visit_id = v.id
INNER JOIN appointments a ON v.appointment_id = a.id
LEFT JOIN appointment_type at ON a.appointment_type_id=at.appointment_type_id
LEFT JOIN users u ON a.veterinarian_id = u.id
LEFT JOIN prescription_product_mapping ppm ON pd.id = ppm.prescription_detail_id
LEFT JOIN products p ON ppm.product_id = p.id
WHERE a.patient_id = @PatientId
ORDER BY pd.created_at DESC, ppm.created_at ASC;";
                var results = (await connection.QueryAsync<PrescriptionDetailFlatResult>(query, new { PatientId = patientId })).ToList();
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPrescriptionDetailsByPatientIdAsync for patient {PatientId}", patientId);
                throw new InvalidOperationException($"Failed to get prescription details for patient {patientId}", ex);
            }
        }
    }
} 