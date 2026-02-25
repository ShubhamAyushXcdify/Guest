using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class VisitInvoiceService : IVisitInvoiceService
    {
        private readonly IVisitInvoiceRepository _repository;
        private readonly IClientService _clientService;
        private readonly IPatientService _patientService;
        private readonly IMapper _mapper;
        private readonly IPurchaseOrderReceivingHistoryRepository _purchaseOrderReceivingHistoryRepository;
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IProductRepository _productRepository;
        private readonly IClinicRepository _clinicRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly ILogger<VisitInvoiceService> _logger;

        public VisitInvoiceService(
            IVisitInvoiceRepository repository,
            IClientService clientService,
            IPatientService patientService,
            IMapper mapper,
            IPurchaseOrderReceivingHistoryRepository purchaseOrderReceivingHistoryRepository,
            IInventoryRepository inventoryRepository,
            IProductRepository productRepository,
            IClinicRepository clinicRepository,
            IVisitRepository visitRepository,
            IClientRepository clientRepository,
            IPatientRepository patientRepository,
            ILogger<VisitInvoiceService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _clientService = clientService ?? throw new ArgumentNullException(nameof(clientService));
            _patientService = patientService ?? throw new ArgumentNullException(nameof(patientService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _purchaseOrderReceivingHistoryRepository = purchaseOrderReceivingHistoryRepository ?? throw new ArgumentNullException(nameof(purchaseOrderReceivingHistoryRepository));
            _inventoryRepository = inventoryRepository ?? throw new ArgumentNullException(nameof(inventoryRepository));
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _clinicRepository = clinicRepository ?? throw new ArgumentNullException(nameof(clinicRepository));
            _visitRepository = visitRepository ?? throw new ArgumentNullException(nameof(visitRepository));
            _clientRepository = clientRepository ?? throw new ArgumentNullException(nameof(clientRepository));
            _patientRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<VisitInvoiceResponseDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return null;
            var dto = _mapper.Map<VisitInvoiceResponseDto>(entity);
            await PopulateProductsAsync(dto);
            await PopulateRelatedAsync(dto);
            return dto;
        }

        public async Task<VisitInvoiceResponseDto?> GetByVisitIdAsync(Guid visitId, Guid? clinicId = null)
        {
            var entity = await _repository.GetByVisitIdAsync(visitId, clinicId);
            if (entity == null) return null;
            var dto = _mapper.Map<VisitInvoiceResponseDto>(entity);
            await PopulateProductsAsync(dto);
            await PopulateRelatedAsync(dto);
            return dto;
        }

        public async Task<PaginatedResponseDto<VisitInvoiceResponseDto>> GetAllAsync(int pageNumber = 1, int pageSize = 10, Guid? visitId = null, Guid? clinicId = null)
        {
            var entities = await _repository.GetAllAsync(pageNumber, pageSize, visitId, clinicId);
            var list = _mapper.Map<List<VisitInvoiceResponseDto>>(entities);
            // Best-effort populate related for each
            foreach (var item in list)
            {
                await PopulateProductsAsync(item);
                await PopulateRelatedAsync(item);
            }
            return new PaginatedResponseDto<VisitInvoiceResponseDto>
            {
                Items = list,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = list.Count
            };
        }

        public async Task<PaginatedResponseDto<VisitInvoiceResponseDto>> GetByFiltersAsync(int pageNumber = 1, int pageSize = 10, Guid? patientId = null, string? status = null, string? paymentMethod = null, DateTimeOffset? createdAtFrom = null, DateTimeOffset? createdAtTo = null, Guid? clinicId = null)
        {
            var entities = await _repository.GetByFiltersAsync(pageNumber, pageSize, patientId, status, paymentMethod, createdAtFrom, createdAtTo, clinicId);
            var list = _mapper.Map<List<VisitInvoiceResponseDto>>(entities);
            foreach (var item in list)
            {
                await PopulateProductsAsync(item);
                await PopulateRelatedAsync(item);
            }
            return new PaginatedResponseDto<VisitInvoiceResponseDto>
            {
                Items = list,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = list.Count
            };
        }

        public async Task<VisitInvoiceResponseDto> CreateAsync(CreateVisitInvoiceRequestDto dto)
        {
            // Validate all referenced IDs exist
            await ValidateReferencedIdsAsync(dto.ClinicId, dto.VisitId, dto.ClientId, dto.PatientId, dto.Products);

            var entity = _mapper.Map<VisitInvoice>(dto);
            var id = await _repository.CreateAsync(entity);
            // Handle products
            if (dto.Products != null && dto.Products.Any())
            {
                var products = dto.Products.Select(p => new VisitInvoiceProduct
                {
                    Id = Guid.Empty,
                    VisitInvoiceId = id,
                    PurchaseOrderReceivingHistoryId = p.PurchaseOrderReceivingHistoryId,
                    Quantity = p.Quantity,
                    IsGiven = p.IsGiven,
                    Discount = p.Discount,
                    DiscountPercentage = p.DiscountPercentage,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                }).ToList();
                await _repository.AddProductsAsync(id, products);
                // Deduct inventory for given items
                await DeductInvoiceProductsInventoryAsync(products);
            }
            var created = await _repository.GetByIdAsync(id);
            var result = _mapper.Map<VisitInvoiceResponseDto>(created);
            await PopulateProductsAsync(result);
            await PopulateRelatedAsync(result);
            return result;
        }

        public async Task<VisitInvoiceResponseDto> UpdateAsync(Guid id, UpdateVisitInvoiceRequestDto dto)
        {
            var existing = await _repository.GetByIdAsync(id) ?? throw new ArgumentException("Visit invoice not found");
            
            // Use existing values if not provided in update DTO (UpdateVisitInvoiceRequestDto doesn't have VisitId, ClientId, PatientId)
            var clinicId = dto.ClinicId ?? existing.ClinicId;
            var visitId = existing.VisitId; // VisitId is not in UpdateVisitInvoiceRequestDto, so use existing
            var clientId = existing.ClientId; // ClientId is not in UpdateVisitInvoiceRequestDto, so use existing
            var patientId = existing.PatientId; // PatientId is not in UpdateVisitInvoiceRequestDto, so use existing
            
            // Validate all referenced IDs exist
            await ValidateReferencedIdsAsync(clinicId, visitId, clientId, patientId, dto.Products);
            
            var updated = _mapper.Map(dto, existing);
            await _repository.UpdateAsync(updated);
            // Replace products if provided
            if (dto.Products != null)
            {
                await _repository.DeleteProductsByInvoiceIdAsync(id);
                var products = dto.Products.Select(p => new VisitInvoiceProduct
                {
                    Id = Guid.Empty,
                    VisitInvoiceId = id,
                    PurchaseOrderReceivingHistoryId = p.PurchaseOrderReceivingHistoryId,
                    Quantity = p.Quantity,
                    IsGiven = p.IsGiven,
                    Discount = p.Discount,
                    DiscountPercentage = p.DiscountPercentage,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                }).ToList();
                await _repository.AddProductsAsync(id, products);
                await DeductInvoiceProductsInventoryAsync(products);
            }
            var after = await _repository.GetByIdAsync(id);
            var result = _mapper.Map<VisitInvoiceResponseDto>(after);
            await PopulateProductsAsync(result);
            await PopulateRelatedAsync(result);
            return result;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _repository.DeleteAsync(id);
        }

        private async Task PopulateRelatedAsync(VisitInvoiceResponseDto dto)
        {
            try
            {
                dto.Client = await _clientService.GetByIdAsync(dto.ClientId);
            }
            catch { }
            try
            {
                dto.Patient = await _patientService.GetByIdAsync(dto.PatientId);
            }
            catch { }
            // PrescriptionDetail removed from response
        }

        private async Task PopulateProductsAsync(VisitInvoiceResponseDto dto)
        {
            var products = await _repository.GetProductsByInvoiceIdAsync(dto.Id);
            if (products == null) return;
            dto.Products = new List<VisitInvoiceProductResponseDto>();
            foreach (var p in products)
            {
                var item = new VisitInvoiceProductResponseDto
                {
                    Id = p.Id,
                    PurchaseOrderReceivingHistoryId = p.PurchaseOrderReceivingHistoryId,
                    Quantity = p.Quantity,
                    IsGiven = p.IsGiven,
                    Discount = p.Discount,
                    DiscountPercentage = p.DiscountPercentage
                };
                try
                {
                    var rh = await _purchaseOrderReceivingHistoryRepository.GetByIdAsync(p.PurchaseOrderReceivingHistoryId);

                    if (rh != null)
                    {
                        item.ReceivingHistory = new PurchaseOrderReceivingHistoryResponseDto
                        {
                            Id = rh.Id,
                            PurchaseOrderId = rh.PurchaseOrderId,
                            PurchaseOrderItemId = rh.PurchaseOrderItemId,
                            ProductId = rh.ProductId,
                            ClinicId = rh.ClinicId,
                            QuantityReceived = rh.QuantityReceived,
                            BatchNumber = rh.BatchNumber,
                            ExpiryDate = rh.ExpiryDate,
                            DateOfManufacture = rh.DateOfManufacture,
                            ReceivedDate = rh.ReceivedDate,
                            ReceivedBy = rh.ReceivedBy,
                            Notes = rh.Notes,
                            UnitCost = rh.UnitCost,
                            LotNumber = rh.LotNumber,
                            SupplierId = rh.SupplierId,
                            QuantityInHand = rh.QuantityOnHand,
                            Barcode = rh.Barcode,
                            BarcodeNumber = rh.BarcodeNumber,
                            Shelf = rh.Shelf,
                            Bin = rh.Bin,
                            CreatedAt = rh.CreatedAt,
                            UpdatedAt = rh.UpdatedAt
                        };

                        // Optionally attach product details
                        var product = await _productRepository.GetByIdAsync(rh.ProductId);
                        if (product != null)
                        {
                            item.Product = _mapper.Map<ProductDto>(product);
                        }
                    }
                    else
                    {
                        item.ReceivingHistory = null;
                    }

                }
                catch { }
                dto.Products.Add(item);
            }
        }

        private async Task DeductInvoiceProductsInventoryAsync(IEnumerable<VisitInvoiceProduct> products)
        {
            foreach (var p in products.Where(x => x.IsGiven && x.Quantity > 0))
            {
                try
                {
                    var receivingHistory = await _purchaseOrderReceivingHistoryRepository.GetByIdAsync(p.PurchaseOrderReceivingHistoryId);
                    if (receivingHistory == null) continue;
                    if (receivingHistory.QuantityOnHand.HasValue && receivingHistory.QuantityOnHand.Value >= p.Quantity)
                    {
                        receivingHistory.QuantityOnHand = (receivingHistory.QuantityOnHand ?? 0) - p.Quantity;
                        receivingHistory.UpdatedAt = DateTimeOffset.UtcNow;
                        await _purchaseOrderReceivingHistoryRepository.UpdateAsync(receivingHistory);
                    }

                    // Deduct from inventory (by product + clinic + batch)
                    var inventoryList = await _inventoryRepository.GetByProductAndBatchRangeAsync(
                        receivingHistory.ProductId,
                        receivingHistory.ClinicId,
                        null,
                        receivingHistory.BatchNumber
                    );
                    var inventory = inventoryList.FirstOrDefault();
                    if (inventory != null && inventory.QuantityOnHand >= p.Quantity)
                    {
                        inventory.QuantityOnHand -= p.Quantity;
                        inventory.UpdatedAt = DateTimeOffset.UtcNow;
                        await _inventoryRepository.UpdateAsync(inventory);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error deducting inventory for visit invoice product {ProductId}", p.Id);
                }
            }
        }

        private async Task ValidateReferencedIdsAsync(
            Guid clinicId,
            Guid? visitId,
            Guid clientId,
            Guid patientId,
            List<VisitInvoiceProductRequestDto>? products = null)
        {
            // Validate ClinicId
            var clinic = await _clinicRepository.GetByIdAsync(clinicId);
            if (clinic == null)
            {
                throw new ArgumentException($"Clinic with ID {clinicId} does not exist.");
            }

            // Validate VisitId if provided
            if (visitId.HasValue && visitId.Value != Guid.Empty)
            {
                var visit = await _visitRepository.GetByIdAsync(visitId.Value);
                if (visit == null)
                {
                    throw new ArgumentException($"Visit with ID {visitId.Value} does not exist.");
                }
            }

            // Validate ClientId
            try
            {
                var client = await _clientRepository.GetByIdAsync(clientId);
                if (client == null)
                {
                    throw new ArgumentException($"Client with ID {clientId} does not exist.");
                }
            }
            catch (InvalidOperationException)
            {
                // Repository throws InvalidOperationException when client not found or error occurs
                throw new ArgumentException($"Client with ID {clientId} does not exist.");
            }

            // Validate PatientId
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                throw new ArgumentException($"Patient with ID {patientId} does not exist.");
            }

            // Validate PurchaseOrderReceivingHistoryId for each product
            if (products != null && products.Any())
            {
                foreach (var product in products)
                {
                    var receivingHistory = await _purchaseOrderReceivingHistoryRepository.GetByIdAsync(product.PurchaseOrderReceivingHistoryId);
                    if (receivingHistory == null)
                    {
                        throw new ArgumentException($"PurchaseOrderReceivingHistory with ID {product.PurchaseOrderReceivingHistoryId} does not exist.");
                    }
                }
            }
        }
    }
}
