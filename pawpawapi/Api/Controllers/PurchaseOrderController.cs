using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Core.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly IPurchaseOrderService _purchaseOrderService;
        private readonly ILogger<PurchaseOrderController> _logger;
        private readonly IUserService _userService;

        public PurchaseOrderController(
            IPurchaseOrderService purchaseOrderService,
            ILogger<PurchaseOrderController> logger,
            IUserService userService)
        {
            _purchaseOrderService = purchaseOrderService;
            _logger = logger;
            _userService = userService;
        }

        /// <summary>
        /// Get all purchase orders with their items
        /// </summary>
        /// <param name="clinicId">Filter by clinic ID</param>
        /// <param name="dateFrom">Filter by order date from (inclusive)</param>
        /// <param name="dateTo">Filter by order date to (inclusive)</param>
        /// <param name="supplierId">Filter by supplier ID</param>
        /// <param name="status">Filter by order status (pending, ordered, partial, received, cancelled). Can be multiple values separated by commas.</param>
        /// <param name="orderNumber">Search by order number (partial match)</param>
        /// <param name="createdBy">Filter by user who created the order</param>
        /// <param name="expectedDeliveryFrom">Filter by expected delivery date from (inclusive)</param>
        /// <param name="expectedDeliveryTo">Filter by expected delivery date to (inclusive)</param>
        /// <param name="actualDeliveryFrom">Filter by actual delivery date from (inclusive)</param>
        /// <param name="actualDeliveryTo">Filter by actual delivery date to (inclusive)</param>
        /// 

        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<PurchaseOrderResponseDto>>> GetAll(
         [FromQuery] Guid? clinicId = null,
         [FromQuery] DateTime? dateFrom = null,
         [FromQuery] DateTime? dateTo = null,
         [FromQuery] Guid? supplierId = null,
         [FromQuery] string? status = null,
         [FromQuery] string? orderNumber = null,
         [FromQuery] Guid? createdBy = null,
         [FromQuery] DateTime? expectedDeliveryFrom = null,
         [FromQuery] DateTime? expectedDeliveryTo = null,
         [FromQuery] DateTime? actualDeliveryFrom = null,
         [FromQuery] DateTime? actualDeliveryTo = null,
         [FromQuery] int page = 1,
         [FromQuery] int pageSize = 10)
        {
            var result = await _purchaseOrderService.GetAllPagedAsync(
                clinicId, dateFrom, dateTo, supplierId,
                string.IsNullOrWhiteSpace(status) ? null : status.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
                orderNumber, createdBy,
                expectedDeliveryFrom, expectedDeliveryTo, actualDeliveryFrom, actualDeliveryTo,
                page, pageSize);

            return Ok(result);
        }

        /// <summary>
        /// Get a purchase order by ID with its items
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrderResponseDto>> GetById(Guid id)
        {
            try
            {
                var item = await _purchaseOrderService.GetByIdAsync(id);
                if (item == null) 
                    return NotFound(new { message = "Purchase order not found" });
                
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving purchase order with ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the purchase order" });
            }
        }

        /// <summary>
        /// Get items for a specific purchase order
        /// </summary>
        [HttpGet("{id}/items")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderItemResponseDto>>> GetItemsByPurchaseOrderId(Guid id)
        {
            try
            {
                var items = await _purchaseOrderService.GetItemsByPurchaseOrderIdAsync(id);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving items for purchase order with ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving purchase order items" });
            }
        }

        /// <summary>
        /// Create a new purchase order with items
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<PurchaseOrderResponseDto>> Create([FromBody] CreatePurchaseOrderRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Purchase order data is required" });

                if (dto.Items == null || !dto.Items.Any())
                    return BadRequest(new { message = "At least one item is required" });

                // Validate items
                foreach (var item in dto.Items)
                {
                    if (item.ProductId == null || item.ProductId == Guid.Empty)
                        return BadRequest(new { message = "Product ID is required for all items" });

                    if (item.QuantityOrdered <= 0)
                        return BadRequest(new { message = "Quantity ordered must be greater than 0" });
                }

                if (dto.CreatedBy == null || dto.CreatedBy == Guid.Empty)
                    return BadRequest(new { message = "CreatedBy is required" });

                var user = await _userService.GetByIdAsync(dto.CreatedBy.Value);
                if (user == null)
                    return BadRequest(new { message = "CreatedBy user does not exist" });

                var created = await _purchaseOrderService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while creating purchase order");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating purchase order");
                return StatusCode(500, new { message = "An error occurred while creating the purchase order" });
            }
        }

        /// <summary>
        /// Update an existing purchase order with items
        /// </summary>
        [HttpPut]
        public async Task<ActionResult<PurchaseOrderResponseDto>> Update([FromBody] UpdatePurchaseOrderRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Purchase order data is required" });

                if (dto.Id == Guid.Empty)
                    return BadRequest(new { message = "Purchase order ID is required" });

                if (dto.Items == null || !dto.Items.Any())
                    return BadRequest(new { message = "At least one item is required" });

                // Validate items
                foreach (var item in dto.Items)
                {
                    if (item.ProductId == null || item.ProductId == Guid.Empty)
                        return BadRequest(new { message = "Product ID is required for all items" });

                    if (item.QuantityOrdered <= 0)
                        return BadRequest(new { message = "Quantity ordered must be greater than 0" });
                }

                var updated = await _purchaseOrderService.UpdateAsync(dto);
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while updating purchase order");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating purchase order");
                return StatusCode(500, new { message = "An error occurred while updating the purchase order" });
            }
        }

        /// <summary>
        /// Delete a purchase order and all its items
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _purchaseOrderService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting purchase order with ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the purchase order" });
            }
        }
    }
} 