using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrderReceivingHistoryController : ControllerBase
    {
        private readonly IPurchaseOrderService _purchaseOrderService;
        private readonly ILogger<PurchaseOrderReceivingHistoryController> _logger;

        public PurchaseOrderReceivingHistoryController(IPurchaseOrderService purchaseOrderService, ILogger<PurchaseOrderReceivingHistoryController> logger)
        {
            _purchaseOrderService = purchaseOrderService ?? throw new ArgumentNullException(nameof(purchaseOrderService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get receiving history with optional filters
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>>> GetFiltered(
            [FromQuery] Guid? id = null,
            [FromQuery] Guid? purchaseOrderId = null,
            [FromQuery] Guid? purchaseOrderItemId = null,
            [FromQuery] Guid? productId = null,
            [FromQuery] Guid? clinicId = null,
            [FromQuery] Guid? supplierId = null,
            [FromQuery] Guid? receivedBy = null,
            [FromQuery] int? quantityReceived = null,
            [FromQuery] int? quantityOnHand = null,
            [FromQuery] string? batchNumber = null,
            [FromQuery] string? lotNumber = null,
            [FromQuery] string? barcode = null,
            [FromQuery] string? shelf = null,
            [FromQuery] string? bin = null,
            [FromQuery] DateTime? expiryDateFrom = null,
            [FromQuery] DateTime? expiryDateTo = null,
            [FromQuery] DateTime? dateOfManufactureFrom = null,
            [FromQuery] DateTime? dateOfManufactureTo = null,
            [FromQuery] DateTime? receivedDateFrom = null,
            [FromQuery] DateTime? receivedDateTo = null,
            [FromQuery] decimal? unitCostFrom = null,
            [FromQuery] decimal? unitCostTo = null,
            [FromQuery] DateTimeOffset? createdFrom = null,
            [FromQuery] DateTimeOffset? createdTo = null,
            [FromQuery] DateTimeOffset? updatedFrom = null,
            [FromQuery] DateTimeOffset? updatedTo = null,
            [FromQuery] string? notes = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? sortOrder = null,
            [FromQuery] int? pageNumber = null,
            [FromQuery] int? pageSize = null
        )
        {
            try
            {
                var filter = new PurchaseOrderReceivingHistoryFilterDto
                {
                    Id = id,
                    PurchaseOrderId = purchaseOrderId,
                    PurchaseOrderItemId = purchaseOrderItemId,
                    ProductId = productId,
                    ClinicId = clinicId,
                    SupplierId = supplierId,
                    ReceivedBy = receivedBy,
                    QuantityReceived = quantityReceived,
                    QuantityOnHand = quantityOnHand,
                    BatchNumber = batchNumber,
                    LotNumber = lotNumber,
                    Barcode = barcode,
                    Shelf = shelf,
                    Bin = bin,
                    ExpiryDateFrom = expiryDateFrom,
                    ExpiryDateTo = expiryDateTo,
                    DateOfManufactureFrom = dateOfManufactureFrom,
                    DateOfManufactureTo = dateOfManufactureTo,
                    ReceivedDateFrom = receivedDateFrom,
                    ReceivedDateTo = receivedDateTo,
                    UnitCostFrom = unitCostFrom,
                    UnitCostTo = unitCostTo,
                    CreatedFrom = createdFrom,
                    CreatedTo = createdTo,
                    UpdatedFrom = updatedFrom,
                    UpdatedTo = updatedTo,
                    Notes = notes,
                    SortBy = sortBy,
                    SortOrder = sortOrder,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                var history = await _purchaseOrderService.GetReceivingHistoryFilteredAsync(filter);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetFiltered");
                return StatusCode(500, "An error occurred while retrieving receiving history");
            }
        }

        /// <summary>
        /// Get all receiving history without filters
        /// </summary>
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>>> GetAllReceivingHistory()
        {
            try
            {
                var history = await _purchaseOrderService.GetAllReceivingHistoryAsync();
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllReceivingHistory");
                return StatusCode(500, "An error occurred while retrieving receiving history");
            }
        }

        /// <summary>
        /// Get receiving history by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrderReceivingHistoryResponseDto>> GetById(Guid id)
        {
            try
            {
                var history = await _purchaseOrderService.GetReceivingHistoryByIdAsync(id);
                return Ok(history);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Receiving history not found with ID {Id}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for ID {Id}", id);
                return StatusCode(500, "An error occurred while retrieving receiving history");
            }
        }

        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>>> GetReceivingHistoryByProduct(Guid productId)
        {
            try
            {
                var history = await _purchaseOrderService.GetReceivingHistoryByProductAsync(productId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetReceivingHistoryByProduct for product {ProductId}", productId);
                return StatusCode(500, "An error occurred while retrieving receiving history for the product");
            }
        }

        [HttpGet("clinic/{clinicId}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>>> GetReceivingHistoryByClinic(
            Guid clinicId,
            [FromQuery] string? productName = null,
            [FromQuery] Guid? companyId = null)
        {
            try
            {
                var history = await _purchaseOrderService.GetReceivingHistoryByClinicAsync(clinicId, productName, companyId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetReceivingHistoryByClinic for clinic {ClinicId}", clinicId);
                return StatusCode(500, "An error occurred while retrieving receiving history for the clinic");
            }
        }

        [HttpGet("product/{productId}/clinic/{clinicId}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>>> GetReceivingHistoryByProductAndClinic(Guid productId, Guid clinicId)
        {
            try
            {
                _logger.LogInformation("Getting receiving history for product {ProductId} and clinic {ClinicId}", productId, clinicId);
                var history = await _purchaseOrderService.GetReceivingHistoryByProductAndClinicAsync(productId, clinicId);
                _logger.LogInformation("Found {Count} receiving history records for product {ProductId} and clinic {ClinicId}",
                    history?.Count() ?? 0, productId, clinicId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetReceivingHistoryByProductAndClinic for product {ProductId} and clinic {ClinicId}", productId, clinicId);
                return StatusCode(500, "An error occurred while retrieving receiving history for the product and clinic");
            }
        }

        /*[HttpGet("products/{productId}/clinics/{clinicId}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>>> GetReceivingHistoryByProductAndClinicPlural(Guid productId, Guid clinicId)
        {
            try
            {
                _logger.LogInformation("Getting receiving history for product {ProductId} and clinic {ClinicId} (plural endpoint)", productId, clinicId);
                var history = await _purchaseOrderService.GetReceivingHistoryByProductAndClinicAsync(productId, clinicId);
                _logger.LogInformation("Found {Count} receiving history records for product {ProductId} and clinic {ClinicId} (plural endpoint)",
                    history?.Count() ?? 0, productId, clinicId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetReceivingHistoryByProductAndClinicPlural for product {ProductId} and clinic {ClinicId}", productId, clinicId);
                return StatusCode(500, "An error occurred while retrieving receiving history for the product and clinic");
            }
        }*/

        /// <summary>
        /// Update receiving history (full update)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<PurchaseOrderReceivingHistoryResponseDto>> Update(Guid id, [FromBody] UpdatePurchaseOrderReceivingHistoryDto dto)
        {
            try
            {
                if (id != dto.Id)
                    return BadRequest("ID in route does not match ID in request body");

                var updated = await _purchaseOrderService.UpdateReceivingHistoryAsync(id, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Receiving history not found with ID {Id}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update for ID {Id}", id);
                return StatusCode(500, "An error occurred while updating receiving history");
            }
        }

        /// <summary>
        /// Partially update receiving history (patch)
        /// </summary>
        [HttpPatch("{id}")]
        public async Task<ActionResult<PurchaseOrderReceivingHistoryResponseDto>> Patch(Guid id, [FromBody] PatchPurchaseOrderReceivingHistoryDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Request body cannot be null");

                var updated = await _purchaseOrderService.PatchReceivingHistoryAsync(id, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Receiving history not found with ID {Id}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Patch for ID {Id}", id);
                return StatusCode(500, "An error occurred while patching receiving history");
            }
        }
    }
}
