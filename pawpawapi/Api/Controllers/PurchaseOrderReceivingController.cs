using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrderReceivingController : ControllerBase
    {
        private readonly IPurchaseOrderService _purchaseOrderService;
        private readonly ILogger<PurchaseOrderReceivingController> _logger;

        public PurchaseOrderReceivingController(
            IPurchaseOrderService purchaseOrderService,
            ILogger<PurchaseOrderReceivingController> logger)
        {
            _purchaseOrderService = purchaseOrderService;
            _logger = logger;
        }

        /// <summary>
        /// Get all purchase orders that can be received (status: ordered, partial)
        /// </summary>
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderResponseDto>>> GetPendingReceiving()
        {
            try
            {
                var orders = await _purchaseOrderService.GetPendingReceivingAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending receiving orders");
                return StatusCode(500, new { message = "An error occurred while retrieving pending receiving orders" });
            }
        }

        /// <summary>
        /// Get a purchase order by ID for receiving
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrderResponseDto>> GetById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    return BadRequest(new { message = "Purchase order ID is required" });

                var order = await _purchaseOrderService.GetByIdAsync(id);
                if (order == null)
                    return NotFound(new { message = "Purchase order not found" });

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving purchase order with ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the purchase order" });
            }
        }

        /// <summary>
        /// Get a purchase order by order number for receiving
        /// </summary>
        [HttpGet("order/{orderNumber}")]
        public async Task<ActionResult<PurchaseOrderResponseDto>> GetByOrderNumber(string orderNumber)
        {
            try
            {
                if (string.IsNullOrEmpty(orderNumber))
                    return BadRequest(new { message = "Order number is required" });

                var order = await _purchaseOrderService.GetByOrderNumberAsync(orderNumber);
                if (order == null)
                    return NotFound(new { message = "Purchase order not found" });

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving purchase order with order number: {OrderNumber}", orderNumber);
                return StatusCode(500, new { message = "An error occurred while retrieving the purchase order" });
            }
        }

        /// <summary>
        /// Receive items for a purchase order
        /// </summary>
        [HttpPost("receive")]
        public async Task<ActionResult<PurchaseOrderResponseDto>> ReceiveItems([FromBody] ReceivePurchaseOrderRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Receiving data is required" });

                if (dto.PurchaseOrderId == Guid.Empty)
                    return BadRequest(new { message = "Purchase order ID is required" });

                if (dto.ReceivedItems == null || !dto.ReceivedItems.Any())
                    return BadRequest(new { message = "At least one received item is required" });

                // Validate received items
                foreach (var item in dto.ReceivedItems)
                {
                    if (item.PurchaseOrderItemId == Guid.Empty)
                        return BadRequest(new { message = "Purchase order item ID is required for all received items" });

                    if (item.ProductId == Guid.Empty)
                        return BadRequest(new { message = "Product ID is required for all received items" });

                    if (item.Batches == null || !item.Batches.Any())
                        return BadRequest(new { message = "At least one batch is required for each received item" });

                    // Validate each batch
                    foreach (var batch in item.Batches)
                    {
                        if (batch.QuantityReceived <= 0)
                            return BadRequest(new { message = "Batch quantity received must be greater than 0" });

                        // Allow batch number and expiry date to be null
                        // if (string.IsNullOrEmpty(batch.BatchNumber))
                        //     return BadRequest(new { message = "Batch number is required for all batches" });

                        // if (!batch.ExpiryDate.HasValue)
                        //     return BadRequest(new { message = "Expiry date is required for all batches" });

                        // if (batch.ExpiryDate.Value <= DateTime.Today)
                        //     return BadRequest(new { message = "Expiry date must be in the future for all batches" });
                    }
                }

                var updated = await _purchaseOrderService.ReceiveItemsAsync(dto);
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while receiving items");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error receiving items for purchase order");
                return StatusCode(500, new { message = "An error occurred while receiving items" });
            }
        }

        /// <summary>
        /// Get receiving history for a purchase order
        /// </summary>
        [HttpGet("history/{orderNumber}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderReceivingHistoryDto>>> GetReceivingHistory(string orderNumber)
        {
            try
            {
                if (string.IsNullOrEmpty(orderNumber))
                    return BadRequest(new { message = "Order number is required" });

                var history = await _purchaseOrderService.GetReceivingHistoryAsync(orderNumber);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving receiving history for order: {OrderNumber}", orderNumber);
                return StatusCode(500, new { message = "An error occurred while retrieving receiving history" });
            }
        }

        /// <summary>
        /// Update received item details (batch number, expiry date, etc.)
        /// </summary>
        [HttpPut("update-received-item")]
        public async Task<ActionResult<PurchaseOrderItemResponseDto>> UpdateReceivedItem([FromBody] UpdateReceivedItemRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Update data is required" });

                if (dto.PurchaseOrderItemId == Guid.Empty)
                    return BadRequest(new { message = "Purchase order item ID is required" });

                // Allow batch number and expiry date to be null for updates
                // if (string.IsNullOrEmpty(dto.BatchNumber))
                //     return BadRequest(new { message = "Batch number is required" });

                // if (!dto.ExpiryDate.HasValue)
                //     return BadRequest(new { message = "Expiry date is required" });

                // if (dto.ExpiryDate.Value <= DateTime.Today)
                //     return BadRequest(new { message = "Expiry date must be in the future" });

                var updated = await _purchaseOrderService.UpdateReceivedItemAsync(dto);
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while updating received item");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating received item");
                return StatusCode(500, new { message = "An error occurred while updating received item" });
            }
        }
    }
}
