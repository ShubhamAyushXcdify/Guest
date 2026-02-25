using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;
        private readonly ILogger<InventoryController> _logger;

        public InventoryController(IInventoryService inventoryService, ILogger<InventoryController> logger)
        {
            _inventoryService = inventoryService ?? throw new ArgumentNullException(nameof(inventoryService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<InventoryResponseDto>>> GetAll(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] Guid? productId = null,
            [FromQuery] Guid? clinicId = null,
            [FromQuery] string? search = null,
            [FromQuery] string? productType = null,
            [FromQuery] string? lotNumber = null,
            [FromQuery] int? quantityOnHand = null,
            [FromQuery] int? quantityReserved = null,
            [FromQuery] int? reorderLevel = null,
            [FromQuery] int? reorderQuantity = null,
            [FromQuery] decimal? unitCost = null,
            [FromQuery] decimal? wholesaleCost = null,
            [FromQuery] decimal? retailPrice = null,
            [FromQuery] string? location = null,
            [FromQuery] string? unitOfMeasure = null,
            [FromQuery] int? unitsPerPackage = null,
            [FromQuery] string? batchNumber = null,
            [FromQuery] bool? receivedFromPo = null,
            [FromQuery] Guid? poItemId = null
        )
        {
            try
            {
                if (pageNumber < 1)
                {
                    return BadRequest("Page number must be greater than 0");
                }

                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest("Page size must be between 1 and 100");
                }

                var inventory = await _inventoryService.GetAllAsync(
                    pageNumber,
                    pageSize,
                    productId,
                    clinicId,
                    search,
                    productType,
                    lotNumber,
                    quantityOnHand,
                    quantityReserved,
                    reorderLevel,
                    reorderQuantity,
                    unitCost,
                    wholesaleCost,
                    retailPrice,
                    location,
                    unitOfMeasure,
                    unitsPerPackage,
                    batchNumber,
                    receivedFromPo,
                    poItemId
                );

                return Ok(inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAll");
                return StatusCode(500, "An error occurred while retrieving inventory items");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryResponseDto>> GetById(Guid id)
        {
            try
            {
                var inventory = await _inventoryService.GetByIdAsync(id);
                if (inventory == null)
                    return NotFound(new { message = "Inventory item not found" });
                
                return Ok(inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById");
                return StatusCode(500, "An error occurred while retrieving the inventory item");
            }
        }

        [HttpGet("dashboard/{clinicId}")]
        public async Task<ActionResult<InventoryDashboardResponseDto>> GetInventoryDashboard(Guid clinicId)
        {
            try
            {
                var item = await _inventoryService.GetInventoryDashboardAsync(clinicId);
                if (item == null) return NotFound(new { message = "Dashboard data not found" });
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetInventoryDashboard");
                return StatusCode(500, "An error occurred while retrieving dashboard data");
            }
        }

        [HttpPost]
        public async Task<ActionResult<InventoryResponseDto>> Create([FromBody] CreateInventoryRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Inventory data is required" });

                if (dto.ProductId == null || dto.ProductId == Guid.Empty)
                    return BadRequest(new { message = "Product ID is required" });

                if (dto.ClinicId == null || dto.ClinicId == Guid.Empty)
                    return BadRequest(new { message = "Clinic ID is required" });

                if (dto.QuantityOnHand < 0)
                    return BadRequest(new { message = "Quantity on hand cannot be negative" });

                var created = await _inventoryService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, "An error occurred while creating the inventory item");
            }
        }

        [HttpPut]
        public async Task<ActionResult<InventoryResponseDto>> Update([FromBody] UpdateInventoryRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Inventory data is required" });

                if (dto.Id == Guid.Empty)
                    return BadRequest(new { message = "Inventory ID is required" });

                if (dto.QuantityOnHand < 0)
                    return BadRequest(new { message = "Quantity on hand cannot be negative" });

                var updated = await _inventoryService.UpdateAsync(dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update");
                return StatusCode(500, "An error occurred while updating the inventory item");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var deleted = await _inventoryService.DeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { message = "Inventory item not found" });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete");
                return StatusCode(500, "An error occurred while deleting the inventory item");
            }
        }

        // New endpoints for PO receiving inventory management
        [HttpGet("product/{productId}/clinic/{clinicId}/batch")]
        public async Task<ActionResult<IEnumerable<InventoryResponseDto>>> GetByProductAndBatch(
            Guid productId,
            Guid clinicId,
            [FromQuery] string? lotNumber = null,
            [FromQuery] string? batchNumber = null)
        {
            try
            {
                var inventory = await _inventoryService.GetInventoryByProductAndBatchAsync(
                    productId, clinicId, lotNumber, batchNumber);
                return Ok(inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inventory by product and batch");
                return StatusCode(500, "An error occurred while retrieving inventory by product and batch");
            }
        }

        [HttpGet("po-item/{poItemId}")]
        public async Task<ActionResult<InventoryResponseDto>> GetByPoItem(Guid poItemId)
        {
            try
            {
                var inventory = await _inventoryService.GetInventoryByPoItemAsync(poItemId);
                if (inventory == null)
                    return NotFound(new { message = "Inventory for this PO item not found" });
                
                return Ok(inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inventory by PO item");
                return StatusCode(500, "An error occurred while retrieving inventory by PO item");
            }
        }

        [HttpGet("received-from-po/{clinicId}")]
        public async Task<ActionResult<PaginatedResponseDto<InventoryResponseDto>>> GetReceivedFromPo(
            Guid clinicId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (pageNumber < 1)
                    return BadRequest("Page number must be greater than 0");

                if (pageSize < 1 || pageSize > 100)
                    return BadRequest("Page size must be between 1 and 100");

                // This would need a new method in the service to filter by received_from_po = true
                // For now, we'll use the existing GetAllAsync with a search parameter
                var inventory = await _inventoryService.GetAllAsync(
                    pageNumber, pageSize, null, clinicId, "received_from_po:true");

                return Ok(inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inventory received from PO");
                return StatusCode(500, "An error occurred while retrieving PO received inventory");
            }
        }

        [HttpGet("search/{clinicId}")]
        public async Task<ActionResult<IEnumerable<InventoryResponseDto>>> SearchProductsByTypeAhead(
            Guid clinicId,
            [FromQuery] string searchTerm,
            [FromQuery] int limit = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest(new { message = "Search term is required" });
                }

                if (limit < 1 || limit > 50)
                {
                    return BadRequest(new { message = "Limit must be between 1 and 50" });
                }

                var inventory = await _inventoryService.SearchProductsByTypeAheadAsync(
                    clinicId, searchTerm, limit);
                
                return Ok(inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchProductsByTypeAhead");
                return StatusCode(500, "An error occurred while searching products");
            }
        }

        [HttpGet("search/{clinicId}/all")]
        public async Task<ActionResult<IEnumerable<InventoryResponseDto>>> SearchProductsByClinic(
            Guid clinicId,
            [FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest(new { message = "Search term is required" });
                }

                var inventory = await _inventoryService.SearchProductsByClinicAsync(
                    clinicId, searchTerm);
                
                return Ok(inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchProductsByClinic");
                return StatusCode(500, "An error occurred while searching products");
            }
        }
    }
} 