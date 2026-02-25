using System;
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
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductController> _logger;

        public ProductController(
            IProductService productService,
            ILogger<ProductController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        /// <summary>
        /// Get all products with comprehensive filtering and pagination
        /// </summary>
        /// <param name="pageNumber">Page number (default: 1)</param>
        /// <param name="pageSize">Page size, max 100 (default: 10)</param>
        /// <param name="search">Search across product number, name, generic name, and NDC number</param>
        /// <param name="category">Filter by category</param>
        /// <param name="productType">Filter by product type (medication, vaccine, supply, food, supplement)</param>
        /// <param name="dosageForm">Filter by dosage form</param>
        /// <param name="unitOfMeasure">Filter by unit of measure</param>
        /// <param name="requiresPrescription">Filter by prescription requirement</param>
        /// <param name="controlledSubstanceSchedule">Filter by controlled substance schedule</param>
        /// <param name="isActive">Filter by active status</param>
        /// <param name="minPrice">Minimum price filter</param>
        /// <param name="maxPrice">Maximum price filter</param>
        /// <param name="lowStock">Filter products with reorder threshold set</param>
        /// <param name="createdFrom">Filter by creation date from</param>
        /// <param name="createdTo">Filter by creation date to</param>
        /// <param name="sortBy">Sort field (name, price, created_at, updated_at, product_number, category)</param>
        /// <param name="sortOrder">Sort order (asc, desc)</param>
        /// <returns>Paginated list of products</returns>
        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<ProductResponseDto>>> GetAll(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] Guid? companyId = null,
            [FromQuery] string? search = null,
            [FromQuery] string? category = null,
            [FromQuery] string? productType = null,
            [FromQuery] string? dosageForm = null,
            [FromQuery] string? unitOfMeasure = null,
            [FromQuery] bool? requiresPrescription = null,
            [FromQuery] string? controlledSubstanceSchedule = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] decimal? minSellingPrice = null,
            [FromQuery] decimal? maxSellingPrice = null,
            [FromQuery] bool? lowStock = null,
            [FromQuery] DateTimeOffset? createdFrom = null,
            [FromQuery] DateTimeOffset? createdTo = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? sortOrder = null)
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

                // Build filter DTO from query parameters
                var filter = new ProductFilterDto
                {
                    CompanyId = companyId,
                    Search = search,
                    Category = category,
                    // ProductType removed
                    DosageForm = dosageForm,
                    UnitOfMeasure = unitOfMeasure,
                    RequiresPrescription = requiresPrescription,
                    ControlledSubstanceSchedule = controlledSubstanceSchedule,
                    IsActive = isActive,
                    MinPrice = minPrice,
                    MaxPrice = maxPrice,
                    MinSellingPrice = minSellingPrice,
                    MaxSellingPrice = maxSellingPrice,
                    LowStock = lowStock,
                    CreatedFrom = createdFrom,
                    CreatedTo = createdTo,
                    SortBy = sortBy,
                    SortOrder = sortOrder
                };

                var products = await _productService.GetAllAsync(
                    pageNumber,
                    pageSize,
                    filter);

                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAll");
                return StatusCode(500, "An error occurred while retrieving products");
            }
        }

        /// <summary>
        /// Get usage history for a product: client name, patient name, quantity given, appointment type, date given; ordered by date given descending with pagination.
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="pageNumber">Page number (default: 1)</param>
        /// <param name="pageSize">Page size, max 100 (default: 10)</param>
        /// <returns>Paginated list of usage history items</returns>
        [HttpGet("{id}/usage-history")]
        public async Task<ActionResult<PaginatedResponseDto<ProductUsageHistoryItemDto>>> GetUsageHistory(
            Guid id,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1)
                return BadRequest("Page number must be greater than 0");
            if (pageSize < 1 || pageSize > 100)
                return BadRequest("Page size must be between 1 and 100");

            var product = await _productService.GetByIdAsync(id);
            if (product == null)
                return NotFound("Product not found");

            var result = await _productService.GetUsageHistoryByProductIdAsync(id, pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductResponseDto>> GetById(Guid id)
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }

        /// <summary>
        /// Create a new product (supports ReorderThreshold for low stock alert and Price)
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ProductResponseDto>> Create(CreateProductRequestDto dto)
        {
            var product = await _productService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        /// <summary>
        /// Update an existing product (supports ReorderThreshold for low stock alert and Price)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ProductResponseDto>> Update(Guid id, UpdateProductRequestDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest("Id mismatch");
            }

            var product = await _productService.UpdateAsync(dto);
            return Ok(product);
        }

        /// <summary>
        /// Get available filter options for products
        /// </summary>
        /// <returns>Available categories, product types, dosage forms, unit of measures, controlled substance schedules, price range, and sort options</returns>
        [HttpGet("filter-options")]
        public async Task<ActionResult<object>> GetFilterOptions()
        {
            try
            {
                var options = await _productService.GetFilterOptionsAsync();
                return Ok(options);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetFilterOptions");
                return StatusCode(500, "An error occurred while retrieving filter options");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                await _productService.DeleteAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Generate QR code data for a product
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <returns>QR code data as JSON object</returns>
        [HttpGet("{id}/qr-code")]
        public async Task<ActionResult<object>> GetQrCodeData(Guid id)
        {
            try
            {
                var product = await _productService.GetByIdAsync(id);
                if (product == null)
                {
                    return NotFound("Product not found");
                }

                // Create QR code data with product information
                var qrCodeData = new
                {
                    ProductId = product.Id,
                    ProductNumber = product.ProductNumber,
                    Name = product.Name,
                    Category = product.Category,
                    // ProductType removed
                    Price = product.Price,
                    RequiresPrescription = product.RequiresPrescription,
                    Timestamp = DateTimeOffset.UtcNow
                };

                return Ok(qrCodeData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating QR code data for product {ProductId}", id);
                return StatusCode(500, "An error occurred while generating QR code data");
            }
        }

        /// <summary>
        /// Get barcode data for a product (using product number as SKU)
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <returns>Barcode data</returns>
        [HttpGet("{id}/barcode")]
        public async Task<ActionResult<object>> GetBarcodeData(Guid id)
        {
            try
            {
                var product = await _productService.GetByIdAsync(id);
                if (product == null)
                {
                    return NotFound("Product not found");
                }

                // Return barcode data using product number as the SKU
                var barcodeData = new
                {
                    Sku = product.ProductNumber,
                    ProductName = product.Name,
                    Category = product.Category,
                    // ProductType removed
                };

                return Ok(barcodeData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting barcode data for product {ProductId}", id);
                return StatusCode(500, "An error occurred while getting barcode data");
            }
        }
    }
} 