using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IProductRepository _productRepository;
        private readonly IPurchaseOrderRepository _purchaseOrderRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<InventoryService> _logger;

        public InventoryService(
            IInventoryRepository inventoryRepository,
            IProductRepository productRepository,
            IPurchaseOrderRepository purchaseOrderRepository,
            IMapper mapper,
            ILogger<InventoryService> logger)
        {
            _inventoryRepository = inventoryRepository ?? throw new ArgumentNullException(nameof(inventoryRepository));
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _purchaseOrderRepository = purchaseOrderRepository ?? throw new ArgumentNullException(nameof(purchaseOrderRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<InventoryResponseDto?> GetByIdAsync(Guid id)
        {
            var inventory = await _inventoryRepository.GetByIdAsync(id);
            if (inventory == null) return null;
            
            var dto = _mapper.Map<InventoryResponseDto>(inventory);
            dto.Status = CalculateStockStatus(dto.QuantityOnHand, dto.Product.ReorderThreshold);
            // Populate product details if ProductId exists
            if (inventory.ProductId.HasValue)
            {
                var product = await _productRepository.GetByIdAsync(inventory.ProductId.Value);
                if (product != null)
                {
                    dto.Product = _mapper.Map<ProductResponseDto>(product);
                }
            }
            
            return dto;
        }

        public async Task<PaginatedResponseDto<InventoryResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
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
                var (inventory, totalCount) = await _inventoryRepository.GetAllAsync(
                    pageNumber,
                    pageSize,
                    productId,
                    clinicId,
                    search,
                    null,
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

                var dtos = _mapper.Map<IEnumerable<InventoryResponseDto>>(inventory).ToList();

                // Populate product details for all inventory items
                var productIds = inventory.Select(i => i.ProductId).Where(id => id.HasValue).Distinct().ToList();
                var products = new Dictionary<Guid, Core.Models.Product>();
                
                foreach (var pid in productIds)
                {
                    var product = await _productRepository.GetByIdAsync(pid.Value);
                    if (product != null)
                    {
                        products[pid.Value] = product;
                    }
                }

                // Assign product details to each inventory DTO
                foreach (var dto in dtos)
                {
                    if (dto.ProductId.HasValue && products.ContainsKey(dto.ProductId.Value))
                    {
                        dto.Product = _mapper.Map<ProductResponseDto>(products[dto.ProductId.Value]);
                    }
                    dto.Status = CalculateStockStatus(dto.QuantityOnHand, dto.Product?.ReorderThreshold);
                }


                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
                
                return new PaginatedResponseDto<InventoryResponseDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = totalPages,
                    HasPreviousPage = pageNumber > 1,
                    HasNextPage = pageNumber < totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<InventoryDashboardResponseDto> GetInventoryDashboardAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            // 1. Get all inventory for the clinic, grouped by product, with sum(quantityOnHand)
            var allInventory = (await _inventoryRepository.GetAllAsync(1, int.MaxValue, null, clinicId)).Items.ToList();

            // Apply date filtering to inventory based on ReceivedDate or CreatedAt
            var filteredInventory = allInventory.Where(i =>
                (!fromDate.HasValue || i.ReceivedDate >= fromDate.Value.Date) &&
                (!toDate.HasValue || i.ReceivedDate <= toDate.Value.Date.AddDays(1).AddTicks(-1))
            ).ToList();

            var productIds = filteredInventory.Select(i => i.ProductId).Distinct().ToList();

            // 2. Get all products for these productIds
            var products = new List<Core.Models.Product>();
            if (productIds.Any())
            {
                foreach (var pid in productIds)
                {
                    var prod = await _productRepository.GetByIdAsync(pid ?? Guid.Empty);
                    if (prod != null) products.Add(prod);
                }
            }

            // 3. Get pending purchase orders for the clinic, filtered by date
            var allPurchaseOrders = await _purchaseOrderRepository.GetAllAsync(clinicId, null, null, null, new[] { "pending" });
            var filteredPurchaseOrders = allPurchaseOrders.Where(po =>
                (!fromDate.HasValue || po.CreatedAt >= fromDate.Value.Date) &&
                (!toDate.HasValue || po.CreatedAt <= toDate.Value.Date.AddDays(1).AddTicks(-1))
            ).ToList();
            var pendingPurchaseOrders = filteredPurchaseOrders.Count();

            // 4. Expiring soon: inventory with expiration_date within 30 days and within the date range
            var expiringSoonItems = filteredInventory.Where(i =>
                i.ExpirationDate.HasValue &&
                (i.ExpirationDate.Value - DateTime.Today).TotalDays <= 30 &&
                (i.ExpirationDate.Value - DateTime.Today).TotalDays >= 0 &&
                (!fromDate.HasValue || i.ExpirationDate.Value >= fromDate.Value.Date) &&
                (!toDate.HasValue || i.ExpirationDate.Value <= toDate.Value.Date.AddDays(1).AddTicks(-1))
            ).ToList();

            // 5. Low stock: sum(quantityOnHand) < threshold for each product in filtered inventory
            var lowStockItems = new List<LowStockItemDto>();
            foreach (var group in filteredInventory.GroupBy(i => i.ProductId))
            {
                var product = products.FirstOrDefault(p => p.Id == group.Key);
                var sumQty = group.Sum(i => i.QuantityOnHand);
                var threshold = product?.ReorderThreshold ?? 0;
                if (sumQty < threshold)
                {
                    lowStockItems.Add(new LowStockItemDto
                    {
                        ProductId = group.Key ?? Guid.Empty,
                        ProductName = product?.Name ?? "",
                        Threshold = threshold,
                        CurrentItemUnits = sumQty
                    });
                }
            }

            // 6. Product type counts (assuming product type is on the product itself)
            // This part needs to be adjusted if product type is not directly on the product model or if it's removed.
            // Based on the previous code, CountType was returning 0, so I'll keep it as 0 for now.
            int CountType(string type) => 0; // ProductType removed or not directly available in inventory

            var dashboard = new InventoryDashboardResponseDto
            {
                TotalItems = filteredInventory.Select(i => i.ProductId).Distinct().Count(),
                LowStockItemsCount = lowStockItems.Count,
                ExpiringSoonItems = expiringSoonItems.Select(i => i.ProductId).Distinct().Count(),
                PendingPurchaseOrders = pendingPurchaseOrders,
                LowStockItems = lowStockItems,
                NumberOfMedicalSupplies = CountType("medical_supplies"),
                NumberOfAntibiotics = CountType("antibiotics"),
                NumberOfPainManagement = CountType("pain_management"),
                NumberOfVaccines = CountType("vaccines"),
                NumberOfSupplements = CountType("supplements"),
                NumberOfEquipment = CountType("equipment"),
                NumberOfFood = CountType("food"),
                NumberOfOther = 0
            };
            return dashboard;
        }

        public async Task<InventoryResponseDto> CreateAsync(CreateInventoryRequestDto dto)
        {
            var inventory = _mapper.Map<Inventory>(dto);
            await _inventoryRepository.AddAsync(inventory);
            
            var responseDto = _mapper.Map<InventoryResponseDto>(inventory);
            
            // Populate product details if ProductId exists
            if (inventory.ProductId.HasValue)
            {
                var product = await _productRepository.GetByIdAsync(inventory.ProductId.Value);
                if (product != null)
                {
                    responseDto.Product = _mapper.Map<ProductResponseDto>(product);
                }
            }
            
            return responseDto;
        }

        public async Task<InventoryResponseDto> UpdateAsync(UpdateInventoryRequestDto dto)
        {
            var inventory = _mapper.Map<Inventory>(dto);
            await _inventoryRepository.UpdateAsync(inventory);
            
            var responseDto = _mapper.Map<InventoryResponseDto>(inventory);
            
            // Populate product details if ProductId exists
            if (inventory.ProductId.HasValue)
            {
                var product = await _productRepository.GetByIdAsync(inventory.ProductId.Value);
                if (product != null)
                {
                    responseDto.Product = _mapper.Map<ProductResponseDto>(product);
                }
            }
            
            return responseDto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                return await _inventoryRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync");
                throw;
            }
        }

        // New methods for PO receiving inventory management
        public async Task<InventoryResponseDto> AddInventoryFromPoReceivingAsync(
            Guid clinicId,
            Guid productId,
            string? lotNumber,
            string? batchNumber,
            DateTime? expirationDate,
            DateTime? dateOfManufacture,
            int quantityReceived,
            decimal? unitCost,
            string? unitOfMeasure,
            int? unitsPerPackage,
            Guid poItemId,
            Guid? supplierId // Added for supplier tracking
        )
        {
            try
            {
                // Convert quantity to EA units for inventory tracking
                var quantityInEa = UomHelper.ConvertToEa(quantityReceived, unitOfMeasure, unitsPerPackage);

                // Check if inventory already exists for this product/batch combination
                var existingInventory = await _inventoryRepository.GetByProductAndBatchAsync(
                    productId, clinicId, lotNumber, batchNumber);

                if (existingInventory != null)
                {
                    // Update existing inventory
                    existingInventory.QuantityOnHand += (int)quantityInEa;
                    existingInventory.UnitCost = unitCost; // Update with latest cost
                    existingInventory.UpdatedAt = DateTimeOffset.UtcNow;
                    if (supplierId.HasValue) existingInventory.SupplierId = supplierId; // Set supplier if provided

                    var updated = await _inventoryRepository.UpdateAsync(existingInventory);
                    var responseDto = _mapper.Map<InventoryResponseDto>(updated);
                    
                    // Populate product details
                    var product = await _productRepository.GetByIdAsync(productId);
                    if (product != null)
                    {
                        responseDto.Product = _mapper.Map<ProductResponseDto>(product);
                    }
                    
                    return responseDto;
                }
                else
                {
                    // Create new inventory record
                    var newInventory = new Inventory
                    {
                        ClinicId = clinicId,
                        ProductId = productId,
                        LotNumber = lotNumber,
                        BatchNumber = batchNumber,
                        ExpirationDate = expirationDate,
                        DateOfManufacture = dateOfManufacture,
                        QuantityOnHand = (int)quantityInEa,
                        QuantityReserved = 0,
                        ReorderLevel = 0,
                        ReorderQuantity = 0,
                        UnitCost = unitCost,
                        WholesaleCost = unitCost, // Set wholesale cost same as unit cost initially
                        RetailPrice = null, // Will be set later if needed
                        UnitOfMeasure = unitOfMeasure ?? "EA",
                        UnitsPerPackage = unitsPerPackage,
                        Location = null, // Will be set later if needed
                        ReceivedFromPo = true,
                        PoItemId = poItemId,
                        ReceivedDate = DateTime.Today,
                        SupplierId = supplierId, // Set supplier
                        CreatedAt = DateTimeOffset.UtcNow,
                        UpdatedAt = DateTimeOffset.UtcNow
                    };

                    await _inventoryRepository.AddAsync(newInventory);
                    var responseDto = _mapper.Map<InventoryResponseDto>(newInventory);
                    
                    // Populate product details
                    var product = await _productRepository.GetByIdAsync(productId);
                    if (product != null)
                    {
                        responseDto.Product = _mapper.Map<ProductResponseDto>(product);
                    }
                    
                    return responseDto;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding inventory from PO receiving");
                throw new InvalidOperationException("Failed to add inventory from purchase order receiving", ex);
            }
        }

        public async Task<IEnumerable<InventoryResponseDto>> GetInventoryByProductAndBatchAsync(
            Guid productId,
            Guid clinicId,
            string? lotNumber = null,
            string? batchNumber = null)
        {
            try
            {
                var inventory = await _inventoryRepository.GetByProductAndBatchRangeAsync(
                    productId, clinicId, lotNumber, batchNumber);
                
                var dtos = _mapper.Map<IEnumerable<InventoryResponseDto>>(inventory).ToList();
                
                // Populate product details for all inventory items
                var product = await _productRepository.GetByIdAsync(productId);
                if (product != null)
                {
                    var productDto = _mapper.Map<ProductResponseDto>(product);
                    foreach (var dto in dtos)
                    {
                        dto.Product = productDto;
                    }
                }
                
                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inventory by product and batch");
                throw;
            }
        }

        public async Task<InventoryResponseDto?> GetInventoryByPoItemAsync(Guid poItemId)
        {
            try
            {
                var inventory = await _inventoryRepository.GetByPoItemAsync(poItemId);
                if (inventory == null) return null;
                
                var dto = _mapper.Map<InventoryResponseDto>(inventory);
                
                // Populate product details if ProductId exists
                if (inventory.ProductId.HasValue)
                {
                    var product = await _productRepository.GetByIdAsync(inventory.ProductId.Value);
                    if (product != null)
                    {
                        dto.Product = _mapper.Map<ProductResponseDto>(product);
                    }
                }
                
                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inventory by PO item");
                throw;
            }
        }

        public async Task<IEnumerable<InventoryResponseDto>> SearchProductsByTypeAheadAsync(
            Guid clinicId,
            string searchTerm,
            int limit = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return new List<InventoryResponseDto>();
                }

                var inventory = await _inventoryRepository.SearchProductsByTypeAheadAsync(clinicId, searchTerm, limit);
                var dtos = _mapper.Map<IEnumerable<InventoryResponseDto>>(inventory).ToList();
                
                // Populate product details for all inventory items
                var productIds = inventory.Select(i => i.ProductId).Where(id => id.HasValue).Distinct().ToList();
                var products = new Dictionary<Guid, Core.Models.Product>();
                
                foreach (var pid in productIds)
                {
                    var product = await _productRepository.GetByIdAsync(pid.Value);
                    if (product != null)
                    {
                        products[pid.Value] = product;
                    }
                }
                
                // Assign product details to each inventory DTO
                foreach (var dto in dtos)
                {
                    if (dto.ProductId.HasValue && products.ContainsKey(dto.ProductId.Value))
                    {
                        dto.Product = _mapper.Map<ProductResponseDto>(products[dto.ProductId.Value]);
                    }
                }
                
                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchProductsByTypeAheadAsync");
                throw;
            }
        }

        public async Task<IEnumerable<InventoryResponseDto>> SearchProductsByClinicAsync(
            Guid clinicId,
            string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return new List<InventoryResponseDto>();
                }

                var inventory = await _inventoryRepository.SearchProductsByClinicAsync(clinicId, searchTerm);
                var dtos = _mapper.Map<IEnumerable<InventoryResponseDto>>(inventory).ToList();
                
                // Populate product details for all inventory items
                var productIds = inventory.Select(i => i.ProductId).Where(id => id.HasValue).Distinct().ToList();
                var products = new Dictionary<Guid, Core.Models.Product>();
                
                foreach (var pid in productIds)
                {
                    var product = await _productRepository.GetByIdAsync(pid.Value);
                    if (product != null)
                    {
                        products[pid.Value] = product;
                    }
                }
                
                // Assign product details to each inventory DTO
                foreach (var dto in dtos)
                {
                    if (dto.ProductId.HasValue && products.ContainsKey(dto.ProductId.Value))
                    {
                        dto.Product = _mapper.Map<ProductResponseDto>(products[dto.ProductId.Value]);
                    }
                }
                
                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchProductsByClinicAsync");
                throw;
            }
        }
        private string CalculateStockStatus(int quantityOnHand, int? reorderThreshold)
        {
            if (quantityOnHand <= 0)
                return "Out of Stock";
            if (reorderThreshold > 0 && quantityOnHand <= reorderThreshold)
                return "Low Stock";
            if (reorderThreshold > 0 && quantityOnHand <= reorderThreshold * 1.5)
                return "Warning";
            return "In Stock";
        }

    }
}
