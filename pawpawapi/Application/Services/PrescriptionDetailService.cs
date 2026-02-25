using System;
using System.Threading.Tasks;
using System.Linq;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using Infrastructure.Repositories;
using Infrastructure.Data;
using Dapper;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.IO;
using QRCoder;
using System.Drawing;
using System.Drawing.Imaging;

namespace Application.Services
{
    public class PrescriptionDetailService : IPrescriptionDetailService
    {
        private readonly IPrescriptionDetailRepository _prescriptionDetailRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IProductRepository _productRepository;
        private readonly IPurchaseOrderReceivingHistoryRepository _purchaseOrderReceivingHistoryRepository;
        private readonly IPatientService _patientService;
        private readonly IClientService _clientService;
        private readonly IComplaintDetailService _complaintDetailService;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IClinicRepository _clinicRepository;
        private readonly IUserRepository _userRepository;
        private readonly IComplaintDetailRepository _complaintDetailRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<PrescriptionDetailService> _logger;
        private readonly DapperDbContext _dbContext;

        public PrescriptionDetailService(
            IPrescriptionDetailRepository prescriptionDetailRepository,
            IVisitRepository visitRepository,
            IProductRepository productRepository,
            IPurchaseOrderReceivingHistoryRepository purchaseOrderReceivingHistoryRepository,
            IPatientService patientService,
            IClientService clientService,
            IComplaintDetailService complaintDetailService,
            IAppointmentRepository appointmentRepository,
            IClinicRepository clinicRepository,
            IUserRepository userRepository,
            IComplaintDetailRepository complaintDetailRepository,
            IMapper mapper,
            ILogger<PrescriptionDetailService> logger,
            DapperDbContext dbContext)
        {
            _prescriptionDetailRepository = prescriptionDetailRepository ?? throw new ArgumentNullException(nameof(prescriptionDetailRepository));
            _visitRepository = visitRepository ?? throw new ArgumentNullException(nameof(visitRepository));
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _purchaseOrderReceivingHistoryRepository = purchaseOrderReceivingHistoryRepository ?? throw new ArgumentNullException(nameof(purchaseOrderReceivingHistoryRepository));
            _patientService = patientService ?? throw new ArgumentNullException(nameof(patientService));
            _clientService = clientService ?? throw new ArgumentNullException(nameof(clientService));
            _complaintDetailService = complaintDetailService ?? throw new ArgumentNullException(nameof(complaintDetailService));
            _appointmentRepository = appointmentRepository ?? throw new ArgumentNullException(nameof(appointmentRepository));
            _clinicRepository = clinicRepository ?? throw new ArgumentNullException(nameof(clinicRepository));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _complaintDetailRepository = complaintDetailRepository ?? throw new ArgumentNullException(nameof(complaintDetailRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<PrescriptionDetailResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var prescriptionDetail = await _prescriptionDetailRepository.GetByIdAsync(id);
                if (prescriptionDetail == null)
                {
                    throw new KeyNotFoundException($"Prescription detail with id {id} not found");
                }

                // Get product mappings with product details
                var productMappings = await _prescriptionDetailRepository.GetProductMappingsWithProductAsync(id);

                var responseDto = new PrescriptionDetailResponseDto
                {
                    Id = prescriptionDetail.Id,
                    VisitId = prescriptionDetail.VisitId,
                    Notes = prescriptionDetail.Notes,
                    CreatedAt = prescriptionDetail.CreatedAt,
                    UpdatedAt = prescriptionDetail.UpdatedAt,
                    ProductMappings = await Task.WhenAll(productMappings.Select(async pm =>
                    {
                        // Fetch purchase order receiving history if ID is provided
                        PurchaseOrderReceivingHistoryResponseDto? purchaseOrderReceivingHistory = null;
                        if (pm.PurchaseOrderReceivingHistoryId.HasValue)
                        {
                            try
                            {
                                var receivingHistory = await _purchaseOrderReceivingHistoryRepository.GetByIdAsync(pm.PurchaseOrderReceivingHistoryId.Value);
                                if (receivingHistory != null)
                                {
                                    purchaseOrderReceivingHistory = new PurchaseOrderReceivingHistoryResponseDto
                                    {
                                        Id = receivingHistory.Id,
                                        PurchaseOrderId = receivingHistory.PurchaseOrderId,
                                        PurchaseOrderItemId = receivingHistory.PurchaseOrderItemId,
                                        ProductId = receivingHistory.ProductId,
                                        ClinicId = receivingHistory.ClinicId,
                                        QuantityReceived = receivingHistory.QuantityReceived,
                                        BatchNumber = receivingHistory.BatchNumber,
                                        ExpiryDate = receivingHistory.ExpiryDate,
                                        DateOfManufacture = receivingHistory.DateOfManufacture,
                                        ReceivedDate = receivingHistory.ReceivedDate,
                                        ReceivedBy = receivingHistory.ReceivedBy,
                                        Notes = receivingHistory.Notes,
                                        UnitCost = receivingHistory.UnitCost,
                                        LotNumber = receivingHistory.LotNumber,
                                        SupplierId = receivingHistory.SupplierId,
                                        QuantityInHand = receivingHistory.QuantityOnHand,
                                        Barcode = receivingHistory.Barcode,
                                        CreatedAt = receivingHistory.CreatedAt,
                                        UpdatedAt = receivingHistory.UpdatedAt
                                    };
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, "Failed to fetch purchase order receiving history {HistoryId} for prescription product mapping {MappingId}",
                                    pm.PurchaseOrderReceivingHistoryId.Value, pm.Id);
                            }
                        }

                        return new PrescriptionProductMappingDto
                        {
                            Id = pm.Id,
                            ProductId = pm.ProductId,
                            IsChecked = pm.IsChecked,
                            Quantity = pm.Quantity,
                            Frequency = pm.Frequency,
                            Directions = pm.Directions,
                            NumberOfDays = pm.NumberOfDays,
                            PurchaseOrderReceivingHistoryId = pm.PurchaseOrderReceivingHistoryId,
                            PurchaseOrderReceivingHistory = purchaseOrderReceivingHistory,
                            Product = pm.Product_Id != null ? new ProductDto
                            {
                                Id = pm.Product_Id,
                                ProductNumber = pm.Product_ProductNumber,
                                Name = pm.Product_Name,
                                GenericName = pm.Product_GenericName,
                                Category = pm.Product_Category,
                                Manufacturer = pm.Product_Manufacturer,
                                NdcNumber = pm.Product_NdcNumber,
                                Strength = pm.Product_Strength,
                                DosageForm = pm.Product_DosageForm,
                                UnitOfMeasure = pm.Product_UnitOfMeasure,
                                RequiresPrescription = pm.Product_RequiresPrescription,
                                ControlledSubstanceSchedule = pm.Product_ControlledSubstanceSchedule,
                                BrandName = pm.Product_BrandName,
                                StorageRequirements = pm.Product_StorageRequirements,
                                IsActive = pm.Product_IsActive,
                                Price = pm.Product_Price,
                                SellingPrice = pm.Product_SellingPrice
                            } : null
                        };
                    }))
                };

                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for prescription detail {PrescriptionDetailId}", id);
                throw;
            }
        }

        public async Task<PrescriptionDetailResponseDto> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                var prescriptionDetail = await _prescriptionDetailRepository.GetByVisitIdAsync(visitId);
                if (prescriptionDetail == null)
                {
                    throw new KeyNotFoundException($"Prescription detail for visit {visitId} not found");
                }

                var productMappings = await _prescriptionDetailRepository.GetProductMappingsWithProductAsync(prescriptionDetail.Id);

                var responseDto = new PrescriptionDetailResponseDto
                {
                    Id = prescriptionDetail.Id,
                    VisitId = prescriptionDetail.VisitId,
                    Notes = prescriptionDetail.Notes,
                    CreatedAt = prescriptionDetail.CreatedAt,
                    UpdatedAt = prescriptionDetail.UpdatedAt,
                    ProductMappings = await Task.WhenAll(productMappings.Select(async pm =>
                    {
                        // Fetch purchase order receiving history if ID is provided
                        PurchaseOrderReceivingHistoryResponseDto? purchaseOrderReceivingHistory = null;
                        if (pm.PurchaseOrderReceivingHistoryId.HasValue)
                        {
                            try
                            {
                                var receivingHistory = await _purchaseOrderReceivingHistoryRepository.GetByIdAsync(pm.PurchaseOrderReceivingHistoryId.Value);
                                if (receivingHistory != null)
                                {
                                    purchaseOrderReceivingHistory = new PurchaseOrderReceivingHistoryResponseDto
                                    {
                                        Id = receivingHistory.Id,
                                        PurchaseOrderId = receivingHistory.PurchaseOrderId,
                                        PurchaseOrderItemId = receivingHistory.PurchaseOrderItemId,
                                        ProductId = receivingHistory.ProductId,
                                        ClinicId = receivingHistory.ClinicId,
                                        QuantityReceived = receivingHistory.QuantityReceived,
                                        BatchNumber = receivingHistory.BatchNumber,
                                        ExpiryDate = receivingHistory.ExpiryDate,
                                        DateOfManufacture = receivingHistory.DateOfManufacture,
                                        ReceivedDate = receivingHistory.ReceivedDate,
                                        ReceivedBy = receivingHistory.ReceivedBy,
                                        Notes = receivingHistory.Notes,
                                        UnitCost = receivingHistory.UnitCost,
                                        LotNumber = receivingHistory.LotNumber,
                                        SupplierId = receivingHistory.SupplierId,
                                        QuantityInHand = receivingHistory.QuantityOnHand,
                                        Barcode = receivingHistory.Barcode,
                                        CreatedAt = receivingHistory.CreatedAt,
                                        UpdatedAt = receivingHistory.UpdatedAt
                                    };
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, "Failed to fetch purchase order receiving history {HistoryId} for prescription product mapping {MappingId}",
                                    pm.PurchaseOrderReceivingHistoryId.Value, pm.Id);
                            }
                        }

                        return new PrescriptionProductMappingDto
                        {
                            Id = pm.Id,
                            ProductId = pm.ProductId,
                            IsChecked = pm.IsChecked,
                            Quantity = pm.Quantity,
                            Frequency = pm.Frequency,
                            Directions = pm.Directions,
                            NumberOfDays = pm.NumberOfDays,
                            PurchaseOrderReceivingHistoryId = pm.PurchaseOrderReceivingHistoryId,
                            PurchaseOrderReceivingHistory = purchaseOrderReceivingHistory,
                            Product = pm.Product_Id != null ? new ProductDto
                            {
                                Id = pm.Product_Id,
                                ProductNumber = pm.Product_ProductNumber,
                                Name = pm.Product_Name,
                                GenericName = pm.Product_GenericName,
                                Category = pm.Product_Category,
                                Manufacturer = pm.Product_Manufacturer,
                                NdcNumber = pm.Product_NdcNumber,
                                Strength = pm.Product_Strength,
                                DosageForm = pm.Product_DosageForm,
                                UnitOfMeasure = pm.Product_UnitOfMeasure,
                                RequiresPrescription = pm.Product_RequiresPrescription,
                                ControlledSubstanceSchedule = pm.Product_ControlledSubstanceSchedule,
                                BrandName = pm.Product_BrandName,
                                StorageRequirements = pm.Product_StorageRequirements,
                                IsActive = pm.Product_IsActive,
                                Price = pm.Product_Price,
                                SellingPrice = pm.Product_SellingPrice
                            } : null
                        };
                    }))
                };
                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<PrescriptionDetailResponseDto> CreateAsync(CreatePrescriptionDetailRequestDto dto)
        {
            try
            {
                var prescriptionDetail = new PrescriptionDetail();
                prescriptionDetail.VisitId = dto.VisitId;
                prescriptionDetail.Notes = dto.Notes;
                prescriptionDetail.CreatedAt = DateTime.UtcNow;
                prescriptionDetail.UpdatedAt = DateTime.UtcNow;

                var createdPrescriptionDetail = await _prescriptionDetailRepository.CreateAsync(prescriptionDetail);
                
                // Determine if prescription is completed based on product mappings
                bool isCompleted = dto.ProductMappings != null && dto.ProductMappings.Any();
                
                if (dto.ProductMappings != null && dto.ProductMappings.Any())
                {
                    foreach (var mappingDto in dto.ProductMappings)
                    {
                        var productMapping = new PrescriptionProductMapping();
                        productMapping.PrescriptionDetailId = createdPrescriptionDetail.Id;
                        productMapping.ProductId = mappingDto.ProductId;
                        productMapping.IsChecked = mappingDto.IsChecked;
                        productMapping.Quantity = mappingDto.Quantity;
                        productMapping.Frequency = mappingDto.Frequency;
                        productMapping.Directions = mappingDto.Directions;
                        productMapping.NumberOfDays = mappingDto.NumberOfDays;
                        productMapping.PurchaseOrderReceivingHistoryId = mappingDto.PurchaseOrderReceivingHistoryId;

                        await _prescriptionDetailRepository.AddProductMappingAsync(createdPrescriptionDetail.Id, productMapping);
                    }
                }

                // Update visit's IsPrescriptionCompleted status
                var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                if (visit != null)
                {
                    visit.IsPrescriptionCompleted = isCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }

                var result = _mapper.Map<PrescriptionDetailResponseDto>(createdPrescriptionDetail);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw;
            }
        }

        public async Task<PrescriptionDetailResponseDto> UpdateAsync(UpdatePrescriptionDetailRequestDto dto)
        {
            try
            {
                var existingPrescriptionDetail = await _prescriptionDetailRepository.GetByIdAsync(dto.Id);
                if (existingPrescriptionDetail == null)
                {
                    throw new KeyNotFoundException($"Prescription detail with id {dto.Id} not found");
                }

                // Get previous mappings for removal
                var previousMappings = await _prescriptionDetailRepository.GetProductMappingsAsync(dto.Id);

                var prescriptionDetail = new PrescriptionDetail();
                prescriptionDetail.Id = dto.Id;
                prescriptionDetail.Notes = dto.Notes;
                var updatedPrescriptionDetail = await _prescriptionDetailRepository.UpdateAsync(prescriptionDetail);

                // Determine if prescription is completed based on product mappings
                bool isCompleted = dto.ProductMappings != null && dto.ProductMappings.Any();

                if (dto.ProductMappings != null)
                {
                    // Remove existing product mappings
                    foreach (var mapping in previousMappings)
                    {
                        await _prescriptionDetailRepository.RemoveProductMappingAsync(updatedPrescriptionDetail.Id, mapping.ProductId);
                    }

                    // Add new product mappings
                    foreach (var mappingDto in dto.ProductMappings)
                    {
                        var mapping = new PrescriptionProductMapping
                        {
                            ProductId = mappingDto.ProductId,
                            IsChecked = mappingDto.IsChecked,
                            Quantity = mappingDto.Quantity,
                            Frequency = mappingDto.Frequency,
                            Directions = mappingDto.Directions,
                            NumberOfDays = mappingDto.NumberOfDays,
                            PurchaseOrderReceivingHistoryId = mappingDto.PurchaseOrderReceivingHistoryId
                        };

                        await _prescriptionDetailRepository.AddProductMappingAsync(updatedPrescriptionDetail.Id, mapping);
                    }
                }

                // Update visit's IsPrescriptionCompleted status
                var visit = await _visitRepository.GetByIdAsync(updatedPrescriptionDetail.VisitId);
                if (visit != null)
                {
                    visit.IsPrescriptionCompleted = isCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }

                var responseDto = new PrescriptionDetailResponseDto
                {
                    Id = updatedPrescriptionDetail.Id,
                    VisitId = updatedPrescriptionDetail.VisitId,
                    Notes = updatedPrescriptionDetail.Notes,
                    CreatedAt = updatedPrescriptionDetail.CreatedAt,
                    UpdatedAt = updatedPrescriptionDetail.UpdatedAt
                };
                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for prescription detail {PrescriptionDetailId}", dto.Id);
                throw;
            }
        }



        public async Task<object> DebugInventoryAsync(Guid purchaseOrderReceivingHistoryId)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();

                // Check if purchase order receiving history exists
                var poHistoryQuery = @"
SELECT id, batch_number, quantity_on_hand, product_id
FROM purchase_order_receiving_history
WHERE id = @PurchaseOrderReceivingHistoryId;";

                var poHistory = await connection.QuerySingleOrDefaultAsync(poHistoryQuery,
                    new { PurchaseOrderReceivingHistoryId = purchaseOrderReceivingHistoryId });

                if (poHistory == null)
                {
                    return new
                    {
                        Status = "ERROR",
                        Message = "Purchase Order Receiving History record not found",
                        PurchaseOrderReceivingHistoryId = purchaseOrderReceivingHistoryId,
                        PurchaseOrderHistory = (object?)null,
                        Inventory = (object?)null
                    };
                }

                // Check inventory for the same product and batch
                var inventoryQuery = @"
SELECT id, product_id, batch_number, quantity_on_hand, status
FROM inventory
WHERE product_id = @ProductId
AND batch_number = @BatchNumber;";

                var inventory = await connection.QuerySingleOrDefaultAsync(inventoryQuery,
                    new { ProductId = poHistory.product_id, BatchNumber = poHistory.batch_number });

                return new
                {
                    Status = "SUCCESS",
                    Message = "Debug information retrieved successfully",
                    PurchaseOrderReceivingHistoryId = purchaseOrderReceivingHistoryId,
                    PurchaseOrderHistory = new
                    {
                        Id = poHistory.id,
                        ProductId = poHistory.product_id,
                        BatchNumber = poHistory.batch_number,
                        QuantityOnHand = poHistory.quantity_on_hand
                    },
                    Inventory = inventory != null ? new
                    {
                        Id = inventory.id,
                        ProductId = inventory.product_id,
                        BatchNumber = inventory.batch_number,
                        QuantityOnHand = inventory.quantity_on_hand,
                        Status = inventory.status
                    } : (object?)null,
                    InventoryExists = inventory != null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DebugInventoryAsync for PurchaseOrderReceivingHistoryId {PurchaseOrderReceivingHistoryId}", purchaseOrderReceivingHistoryId);
                return new
                {
                    Status = "ERROR",
                    Message = ex.Message,
                    PurchaseOrderReceivingHistoryId = purchaseOrderReceivingHistoryId,
                    PurchaseOrderHistory = (object?)null,
                    Inventory = (object?)null
                };
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingPrescriptionDetail = await _prescriptionDetailRepository.GetByIdAsync(id);
                if (existingPrescriptionDetail == null)
                {
                    throw new KeyNotFoundException($"Prescription detail with id {id} not found");
                }

                return await _prescriptionDetailRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for prescription detail {PrescriptionDetailId}", id);
                throw;
            }
        }

        public async Task<List<PrescriptionDetailFullResponseDto>> GetByPatientIdAsync(Guid patientId)
        {
            try
            {
                var flatResults = await _prescriptionDetailRepository.GetPrescriptionDetailsByPatientIdAsync(patientId);

                // Group by PrescriptionDetailId
                var grouped = flatResults
                    .GroupBy(r => r.PrescriptionDetailId)
                    .Select(g =>
                    {
                        var first = g.First();
                        var dto = new PrescriptionDetailFullResponseDto
                        {
                            PrescriptionDetailId = first.PrescriptionDetailId,
                            Notes = first.Notes,
                            CreatedAt = first.CreatedAt,
                            UpdatedAt = first.UpdatedAt,
                            VisitId = first.VisitId,
                            AppointmentId = first.AppointmentId,
                            IsIntakeCompleted = first.IsIntakeCompleted,
                            IsComplaintsCompleted = first.IsComplaintsCompleted,
                            IsVitalsCompleted = first.IsVitalsCompleted,
                            IsPlanCompleted = first.IsPlanCompleted,
                            VisitCreatedAt = first.VisitCreatedAt,
                            VisitUpdatedAt = first.VisitUpdatedAt,
                            ClinicId = first.ClinicId,
                            PatientId = first.PatientId,
                            ClientId = first.ClientId,
                            VeterinarianId = first.VeterinarianId,
                            VeterinarianName = first.VeterinarianName,
                            RoomId = first.RoomId,
                            AppointmentDate = first.AppointmentDate,
                            RoomSlotId = first.RoomSlotId,
                            AppointmentType = first.AppointmentType,
                            Reason = first.Reason,
                            Status = first.Status,
                            AppointmentNotes = first.AppointmentNotes,
                            ProductMappings = g
                                .Where(x => x.ProductMappingId != null)
                                .Select(x => new PrescriptionProductMappingDto
                                {
                                    Id = x.ProductMappingId,
                                    ProductId = x.ProductId,
                                    IsChecked = x.IsChecked,
                                    Quantity = x.Quantity,
                                    Frequency = x.Frequency,
                                    Directions = x.Directions,
                                    NumberOfDays = x.NumberOfDays,
                                    PurchaseOrderReceivingHistoryId = x.PurchaseOrderReceivingHistoryId,
                                    Product = x.Product_Id != null ? new ProductDto
                                    {
                                        Id = x.Product_Id,
                                        Name = x.Product_Name,
                                        GenericName = x.Product_GenericName,
                                        Category = x.Product_Category,
                                        Manufacturer = x.Product_Manufacturer,
                                        NdcNumber = x.Product_NdcNumber,
                                        Strength = x.Product_Strength,
                                        DosageForm = x.Product_DosageForm,
                                        UnitOfMeasure = x.Product_UnitOfMeasure,
                                        RequiresPrescription = x.Product_RequiresPrescription,
                                        ControlledSubstanceSchedule = x.Product_ControlledSubstanceSchedule,
                                        StorageRequirements = x.Product_StorageRequirements,
                                        IsActive = x.Product_IsActive
                                    } : null
                                }).ToList()
                        };
                        return dto;
                    })
                    .ToList();

                return grouped;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByPatientIdAsync for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<PrescriptionPdfResponseDto> GeneratePrescriptionPdfAsync(Guid visitId)
        {
            try
            {
                _logger.LogInformation("Starting PDF generation for visit {VisitId}", visitId);

                // Get visit details
                var visit = await _visitRepository.GetByIdAsync(visitId);
                if (visit == null)
                {
                    throw new KeyNotFoundException($"Visit with ID {visitId} not found");
                }

                // Get patient details
                PatientResponseDto? patient = null;
                if (visit.PatientId.HasValue)
                {
                    patient = await _patientService.GetByIdAsync(visit.PatientId.Value);
                }

                // Get client details
                ClientResponseDto? client = null;
                if (patient?.ClientId.HasValue == true)
                {
                    client = await _clientService.GetByIdAsync(patient.ClientId.Value);
                }

                // Get complaint details
                ComplaintDetailResponseDto? complaints = null;
                try
                {
                    _logger.LogInformation("Attempting to get complaints for visit {VisitId}", visitId);
                    complaints = await _complaintDetailService.GetByVisitIdAsync(visitId);
                    _logger.LogInformation("Found complaints for visit {VisitId}: {ComplaintsCount} symptoms, Notes: {Notes}",
                        visitId, complaints?.Symptoms?.Count ?? 0, complaints?.Notes);
                }
                catch (KeyNotFoundException ex)
                {
                    // No complaints found, continue without them
                    _logger.LogInformation("No complaints found for visit {VisitId}: {Message}", visitId, ex.Message);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error retrieving complaints for visit {VisitId}", visitId);
                }

                // Get prescription details
                PrescriptionDetailResponseDto? prescriptions = null;
                try
                {
                    _logger.LogInformation("Attempting to get prescriptions for visit {VisitId}", visitId);
                    prescriptions = await GetByVisitIdAsync(visitId);

                    if (prescriptions != null)
                    {
                        _logger.LogInformation("Found prescriptions for visit {VisitId}: {ProductMappingsCount} mappings, Notes: {Notes}",
                            visitId, prescriptions.ProductMappings?.Count ?? 0, prescriptions.Notes);

                        // Log detailed prescription data for debugging
                        if (prescriptions.ProductMappings != null)
                        {
                            foreach (var mapping in prescriptions.ProductMappings)
                            {
                                _logger.LogInformation("Prescription mapping - IsChecked: {IsChecked}, Product: {ProductName}, Quantity: {Quantity}, Frequency: {Frequency}",
                                    mapping.IsChecked, mapping.Product?.Name, mapping.Quantity, mapping.Frequency);
                            }
                        }
                    }
                    else
                    {
                        _logger.LogWarning("Prescriptions object is null for visit {VisitId}", visitId);
                    }
                }
                catch (KeyNotFoundException ex)
                {
                    // No prescriptions found, continue without them
                    _logger.LogInformation("No prescriptions found for visit {VisitId}: {Message}", visitId, ex.Message);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error retrieving prescriptions for visit {VisitId}", visitId);
                }

                // Generate PDF
                var pdfBytes = await GeneratePdfBytesAsync(visit, patient, client, prescriptions);
                var base64Pdf = Convert.ToBase64String(pdfBytes);

                var fileName = $"Prescription_{patient?.Name?.Replace(" ", "_") ?? "Unknown"}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";

                return new PrescriptionPdfResponseDto
                {
                    VisitId = visitId,
                    PdfBase64 = base64Pdf,
                    FileName = fileName,
                    GeneratedAt = DateTime.UtcNow,
                    PatientName = patient?.Name,
                    ClientName = client != null ? $"{client.FirstName} {client.LastName}".Trim() : null,
                    ComplaintsSummary = complaints?.Notes,
                    PrescriptionItemsCount = prescriptions?.ProductMappings?.Count(pm => pm.IsChecked) ?? 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating prescription PDF for visit {VisitId}", visitId);
                throw;
            }
        }

        private async Task<byte[]> GeneratePdfBytesAsync(
            Visit visit,
            PatientResponseDto? patient,
            ClientResponseDto? client,
            PrescriptionDetailResponseDto? prescriptions)
        {
            using (var ms = new MemoryStream())
            {
                var document = new Document(PageSize.A4, 25, 25, 25, 25);
                var writer = PdfWriter.GetInstance(document, ms);
                document.Open();

                // Define colors and fonts - Clean professional design
                var primaryColor = new BaseColor(60, 60, 60); // Dark Gray
                var lightColor = new BaseColor(245, 245, 245); // Light Gray
                var borderColor = new BaseColor(200, 200, 200); // Medium Gray
                var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14, primaryColor); // Smaller heading
                var subHeaderFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, primaryColor);
                var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 9, BaseColor.BLACK);
                var boldFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.BLACK);
                var smallFont = FontFactory.GetFont(FontFactory.HELVETICA, 8, BaseColor.DARK_GRAY);

                // Header Section with QR Code
                var headerTable = new PdfPTable(2) { WidthPercentage = 100, SpacingBefore = 5f };
                headerTable.SetWidths(new float[] { 70f, 30f });

                // Left side - Title
                var titleCell = new PdfPCell(new Paragraph("PRESCRIPTION DETAILS", headerFont))
                {
                    Border = iTextSharp.text.Rectangle.NO_BORDER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    PaddingBottom = 5f
                };
                headerTable.AddCell(titleCell);

                // Right side - QR Code
                var qrCell = new PdfPCell()
                {
                    Border = iTextSharp.text.Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    PaddingBottom = 5f
                };

                try
                {
                    var qrCodeImage = GenerateQRCode($"Visit ID: {visit.Id}");
                    if (qrCodeImage != null)
                    {
                        qrCodeImage.ScaleToFit(60f, 60f);
                        qrCell.AddElement(qrCodeImage);
                    }
                    else
                    {
                        qrCell.AddElement(new Paragraph("QR Code\nUnavailable") { Font = smallFont, Alignment = Element.ALIGN_CENTER });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Failed to generate QR code for visit {VisitId}: {Error}", visit.Id, ex.Message);
                    qrCell.AddElement(new Paragraph("QR Code\nError") { Font = smallFont, Alignment = Element.ALIGN_CENTER });
                }

                headerTable.AddCell(qrCell);
                document.Add(headerTable);

                // Add spacing
                document.Add(new Paragraph(" ", normalFont) { SpacingAfter = 10f });

                // Get appointment information to access clinic and veterinarian details
                _logger.LogInformation("Retrieving appointment data for appointment ID: {AppointmentId}", visit.AppointmentId);
                var appointmentData = await GetAppointmentWithRelatedDataAsync(visit.AppointmentId);

                if (appointmentData == null)
                {
                    _logger.LogWarning("No appointment data found for appointment ID: {AppointmentId}", visit.AppointmentId);
                }
                else
                {
                    _logger.LogInformation("Appointment data retrieved - Clinic: {ClinicName}, Vet: {VeterinarianName}",
                        appointmentData.ClinicName ?? "NULL", appointmentData.VeterinarianName ?? "NULL");
                }

                // 2x2 Grid Layout: Clinic/Vet, Client/Patient
                var infoTable = new PdfPTable(2) { WidthPercentage = 100, SpacingAfter = 15f };
                infoTable.SetWidths(new float[] { 1f, 1f });

                // Clinic Section (Top Left)
                var clinicCell = new PdfPCell();
                clinicCell.BackgroundColor = lightColor;
                clinicCell.Padding = 8f;
                clinicCell.Border = iTextSharp.text.Rectangle.BOX;
                clinicCell.BorderColor = borderColor;

                var clinicTitle = new Paragraph("CLINIC", subHeaderFont);
                clinicCell.AddElement(clinicTitle);
                clinicCell.AddElement(new Paragraph(appointmentData?.ClinicName ?? "N/A") { Font = normalFont });
                if (!string.IsNullOrEmpty(appointmentData?.ClinicAddress))
                    clinicCell.AddElement(new Paragraph(appointmentData.ClinicAddress) { Font = normalFont });
                if (!string.IsNullOrEmpty(appointmentData?.ClinicCity))
                {
                    var cityState = appointmentData.ClinicCity + (!string.IsNullOrEmpty(appointmentData.ClinicState) ? $", {appointmentData.ClinicState}" : "");
                    clinicCell.AddElement(new Paragraph(cityState) { Font = normalFont });
                }
                if (!string.IsNullOrEmpty(appointmentData?.ClinicPhone))
                    clinicCell.AddElement(new Paragraph($"Phone: {appointmentData.ClinicPhone}") { Font = normalFont });

                // Veterinarian Section (Top Right)
                var vetCell = new PdfPCell();
                vetCell.BackgroundColor = lightColor;
                vetCell.Padding = 8f;
                vetCell.Border = iTextSharp.text.Rectangle.BOX;
                vetCell.BorderColor = borderColor;

                var vetTitle = new Paragraph("VETERINARIAN", subHeaderFont);
                vetCell.AddElement(vetTitle);
                var vetName = !string.IsNullOrEmpty(appointmentData?.VeterinarianName)
                    ? $"Dr. {appointmentData.VeterinarianName}"
                    : "N/A";
                vetCell.AddElement(new Paragraph(vetName) { Font = normalFont });
                if (!string.IsNullOrEmpty(appointmentData?.VeterinarianEmail))
                    vetCell.AddElement(new Paragraph($"Email: {appointmentData.VeterinarianEmail}") { Font = normalFont });
                vetCell.AddElement(new Paragraph($"Date: {appointmentData?.AppointmentDate:MMM dd, yyyy}" ?? "N/A") { Font = normalFont });

                // Client Section (Bottom Left)
                var clientCell = new PdfPCell();
                clientCell.BackgroundColor = lightColor;
                clientCell.Padding = 8f;
                clientCell.Border = iTextSharp.text.Rectangle.BOX;
                clientCell.BorderColor = borderColor;

                var clientTitle = new Paragraph("CLIENT", subHeaderFont);
                clientCell.AddElement(clientTitle);
                if (client != null)
                {
                    clientCell.AddElement(new Paragraph($"{client.FirstName} {client.LastName}".Trim()) { Font = normalFont });
                    if (!string.IsNullOrEmpty(client.Email))
                        clientCell.AddElement(new Paragraph($"Email: {client.Email}") { Font = normalFont });
                    if (!string.IsNullOrEmpty(client.PhonePrimary))
                        clientCell.AddElement(new Paragraph($"Phone: {client.PhonePrimary}") { Font = normalFont });

                    var address = new List<string>();
                    if (!string.IsNullOrEmpty(client.AddressLine1)) address.Add(client.AddressLine1);
                    if (!string.IsNullOrEmpty(client.City)) address.Add(client.City);
                    if (address.Any())
                        clientCell.AddElement(new Paragraph(string.Join(", ", address)) { Font = normalFont });
                }
                else
                {
                    clientCell.AddElement(new Paragraph("N/A") { Font = normalFont });
                }

                // Patient Section (Bottom Right)
                var patientCell = new PdfPCell();
                patientCell.BackgroundColor = lightColor;
                patientCell.Padding = 8f;
                patientCell.Border = iTextSharp.text.Rectangle.BOX;
                patientCell.BorderColor = borderColor;

                var patientTitle = new Paragraph("PATIENT", subHeaderFont);
                patientCell.AddElement(patientTitle);
                if (patient != null)
                {
                    patientCell.AddElement(new Paragraph(patient.Name ?? "N/A") { Font = normalFont });
                    patientCell.AddElement(new Paragraph($"{patient.Species ?? "N/A"} - {patient.Breed ?? "N/A"}") { Font = normalFont });
                    if (patient.DateOfBirth.HasValue)
                        patientCell.AddElement(new Paragraph($"DOB: {patient.DateOfBirth.Value:MMM dd, yyyy}") { Font = normalFont });
                    if (patient.WeightKg.HasValue)
                        patientCell.AddElement(new Paragraph($"Weight: {patient.WeightKg.Value:F1} kg") { Font = normalFont });
                    if (!string.IsNullOrEmpty(patient.Gender))
                        patientCell.AddElement(new Paragraph($"Gender: {patient.Gender}") { Font = normalFont });
                }
                else
                {
                    patientCell.AddElement(new Paragraph("N/A") { Font = normalFont });
                }

                infoTable.AddCell(clinicCell);
                infoTable.AddCell(vetCell);
                infoTable.AddCell(clientCell);
                infoTable.AddCell(patientCell);
                document.Add(infoTable);

                // Complaints Section - With proper heading
                var complaintsTable = new PdfPTable(1) { WidthPercentage = 100, SpacingBefore = 10f, SpacingAfter = 10f };

                // Complaints header with white text on dark background
                var complaintsHeaderCell = new PdfPCell(new Paragraph("SYMPTOMS", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE)))
                {
                    BackgroundColor = primaryColor,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    Padding = 5f,
                    Border = iTextSharp.text.Rectangle.BOX,
                    BorderColor = borderColor
                };
                complaintsTable.AddCell(complaintsHeaderCell);

                var complaintsContentCell = new PdfPCell();
                complaintsContentCell.Padding = 8f;
                complaintsContentCell.Border = iTextSharp.text.Rectangle.BOX;
                complaintsContentCell.BorderColor = borderColor;

                // Get complaint details directly from repository
                try
                {
                    var complaintDetail = await _complaintDetailRepository.GetByVisitIdAsync(visit.Id);
                    if (complaintDetail != null && complaintDetail.Symptoms != null && complaintDetail.Symptoms.Any())
                    {
                        var symptomsText = string.Join(", ", complaintDetail.Symptoms.Select(s => s.Name));
                        complaintsContentCell.AddElement(new Paragraph($"Symptoms: {symptomsText}") { Font = normalFont });
                        if (!string.IsNullOrEmpty(complaintDetail.Notes))
                            complaintsContentCell.AddElement(new Paragraph($"Notes: {complaintDetail.Notes}") { Font = normalFont });
                    }
                    else
                    {
                        complaintsContentCell.AddElement(new Paragraph("No Symptoms recorded for this visit") { Font = normalFont });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to retrieve complaint details for visit {VisitId}", visit.Id);
                    complaintsContentCell.AddElement(new Paragraph("No Symptoms recorded for this visit") { Font = normalFont });
                }

                complaintsTable.AddCell(complaintsContentCell);
                document.Add(complaintsTable);

                // Prescription Section - Add heading and include barcode
                var prescriptionHeaderTable = new PdfPTable(1) { WidthPercentage = 100, SpacingBefore = 10f };
                var prescriptionHeaderCell = new PdfPCell(new Paragraph("PRESCRIPTION", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE)))
                {
                    BackgroundColor = primaryColor,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    Padding = 5f,
                    Border = iTextSharp.text.Rectangle.BOX,
                    BorderColor = borderColor
                };
                prescriptionHeaderTable.AddCell(prescriptionHeaderCell);
                document.Add(prescriptionHeaderTable);

                // Prescription Table with 7 columns (added Directions)
                var prescriptionTable = new PdfPTable(7) { WidthPercentage = 100, SpacingBefore = 5f };
                prescriptionTable.SetWidths(new float[] { 20f, 12f, 20f, 10f, 10f, 14f, 14f }); // Medicine, Frequency, Directions, Days, Quantity, Expiration Date, Price

                // Header row - Added Directions column
                var headerCells = new string[] { "Medicine", "Frequency", "Directions", "Days", "Quantity", "Expiration Date", "Price" };
                foreach (var header in headerCells)
                {
                    var headerCell = new PdfPCell(new Paragraph(header, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.WHITE)))
                    {
                        BackgroundColor = primaryColor,
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        Padding = 6f,
                        Border = iTextSharp.text.Rectangle.BOX,
                        BorderColor = borderColor
                    };
                    prescriptionTable.AddCell(headerCell);
                }

                if (prescriptions != null)
                {
                    _logger.LogInformation("Processing prescription data for PDF generation");
                    var allItems = prescriptions.ProductMappings?.ToList();

                    if (allItems != null && allItems.Any())
                    {
                        _logger.LogInformation("Found {ItemCount} prescription items to display", allItems.Count);

                        foreach (var item in allItems)
                        {
                            // Medicine name (Column 1)
                            var medicineCell = new PdfPCell(new Paragraph(item.Product?.Name ?? "Unknown Medicine", normalFont))
                            {
                                Padding = 5f,
                                Border = iTextSharp.text.Rectangle.BOX,
                                BorderColor = borderColor
                            };
                            prescriptionTable.AddCell(medicineCell);

                            // Frequency (Column 2)
                            string frequencyText = (string.IsNullOrEmpty(item.Frequency) && item.NumberOfDays == 0) ? "-" : (item.Frequency ?? "N/A");
                            var frequencyCell = new PdfPCell(new Paragraph(frequencyText, normalFont))
                            {
                                HorizontalAlignment = Element.ALIGN_CENTER,
                                Padding = 5f,
                                Border = iTextSharp.text.Rectangle.BOX,
                                BorderColor = borderColor
                            };
                            prescriptionTable.AddCell(frequencyCell);

                            // Directions (Column 3)
                            string directionsText = string.IsNullOrEmpty(item.Directions) ? "-" : item.Directions;
                            var directionsCell = new PdfPCell(new Paragraph(directionsText, normalFont))
                            {
                                HorizontalAlignment = string.IsNullOrEmpty(item.Directions) ? Element.ALIGN_CENTER : Element.ALIGN_LEFT,
                                Padding = 5f,
                                Border = iTextSharp.text.Rectangle.BOX,
                                BorderColor = borderColor
                            };
                            prescriptionTable.AddCell(directionsCell);

                            // Days (Column 4)
                            string daysText = (string.IsNullOrEmpty(item.Frequency) && item.NumberOfDays == 0) ? "-" : (item.NumberOfDays?.ToString() ?? "N/A");
                            var daysCell = new PdfPCell(new Paragraph(daysText, normalFont))
                            {
                                HorizontalAlignment = Element.ALIGN_CENTER,
                                Padding = 5f,
                                Border = iTextSharp.text.Rectangle.BOX,
                                BorderColor = borderColor
                            };
                            prescriptionTable.AddCell(daysCell);

                            // Quantity (Column 5)
                            var quantityCell = new PdfPCell(new Paragraph(item.Quantity?.ToString() ?? "N/A", normalFont))
                            {
                                HorizontalAlignment = Element.ALIGN_CENTER,
                                Padding = 5f,
                                Border = iTextSharp.text.Rectangle.BOX,
                                BorderColor = borderColor
                            };
                            prescriptionTable.AddCell(quantityCell);

                            // Expiration Date (Column 6)
                            var expirationDate = item.PurchaseOrderReceivingHistory?.ExpiryDate?.ToString("dd-MM-yyyy") ?? "N/A";
                            var expirationDateCell = new PdfPCell(new Paragraph(expirationDate, normalFont))
                            {
                                HorizontalAlignment = Element.ALIGN_CENTER,
                                Padding = 5f,
                                Border = iTextSharp.text.Rectangle.BOX,
                                BorderColor = borderColor
                            };
                            prescriptionTable.AddCell(expirationDateCell);

                            // Selling Price (Column 7)
                            var sellingPrice =item.Product?.SellingPrice?.ToString("C") ?? "N/A";
                            var sellingPriceCell = new PdfPCell(new Paragraph(sellingPrice, normalFont))
                            {
                                HorizontalAlignment = Element.ALIGN_CENTER,
                                Padding = 5f,
                                Border = iTextSharp.text.Rectangle.BOX,
                                BorderColor = borderColor
                            };
                            prescriptionTable.AddCell(sellingPriceCell);
                        }
                    }
                    else
                    {
                        // No prescription items found
                        _logger.LogWarning("No prescription items found for visit {VisitId}", visit.Id);
                        var noDataCell = new PdfPCell(new Paragraph("No prescription items found", normalFont))
                        {
                            Colspan = 7, // Updated to 7 columns (added Directions)
                            HorizontalAlignment = Element.ALIGN_CENTER,
                            Padding = 10f,
                            Border = iTextSharp.text.Rectangle.BOX,
                            BorderColor = borderColor
                        };
                        prescriptionTable.AddCell(noDataCell);
                    }
                }
                else
                {
                    // Prescriptions object is null
                    _logger.LogWarning("Prescriptions object is null for visit {VisitId}", visit.Id);
                    var noDataCell = new PdfPCell(new Paragraph("No prescription data available", normalFont))
                    {
                        Colspan = 7, // Updated to 7 columns (added Directions)
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        Padding = 10f,
                        Border = iTextSharp.text.Rectangle.BOX,
                        BorderColor = borderColor
                    };
                    prescriptionTable.AddCell(noDataCell);
                }

                document.Add(prescriptionTable);

                // Footer
                var footerTable = new PdfPTable(1) { WidthPercentage = 100, SpacingBefore = 20f };
                var footerCell = new PdfPCell(new Paragraph("This prescription was generated electronically.", smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    Border = iTextSharp.text.Rectangle.TOP_BORDER,
                    BorderColor = new BaseColor(200, 200, 200),
                    BorderWidth = 0.5f,
                    Padding = 15,
                    BackgroundColor = BaseColor.WHITE
                };
                footerTable.AddCell(footerCell);
                document.Add(footerTable);

                document.Close();
                return ms.ToArray();
            }
        }



        private PdfPTable CreateSectionTable(string title, BaseColor primaryColor, BaseColor lightColor)
        {
            var table = new PdfPTable(1) { WidthPercentage = 100, SpacingBefore = 15f, SpacingAfter = 5f };

            // Section header
            var headerCell = new PdfPCell(new Paragraph(title, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE)))
            {
                BackgroundColor = primaryColor,
                HorizontalAlignment = Element.ALIGN_LEFT,
                Padding = 10,
                Border = iTextSharp.text.Rectangle.BOX,
                BorderColor = new BaseColor(200, 200, 200),
                BorderWidth = 1f
            };
            table.AddCell(headerCell);

            return table;
        }

        private void AddInfoRow(PdfPTable table, string label, string value, iTextSharp.text.Font labelFont, iTextSharp.text.Font valueFont)
        {
            var infoTable = new PdfPTable(2) { WidthPercentage = 100 };
            infoTable.SetWidths(new float[] { 30f, 70f });

            var labelCell = new PdfPCell(new Paragraph(label, labelFont))
            {
                Border = iTextSharp.text.Rectangle.NO_BORDER,
                Padding = 5,
                HorizontalAlignment = Element.ALIGN_LEFT
            };

            var valueCell = new PdfPCell(new Paragraph(value, valueFont))
            {
                Border = iTextSharp.text.Rectangle.NO_BORDER,
                Padding = 5,
                HorizontalAlignment = Element.ALIGN_LEFT
            };

            infoTable.AddCell(labelCell);
            infoTable.AddCell(valueCell);

            var containerCell = new PdfPCell(infoTable)
            {
                Border = iTextSharp.text.Rectangle.NO_BORDER,
                Padding = 0
            };

            table.AddCell(containerCell);
        }

        private void AddTableHeader(PdfPTable table, string text, iTextSharp.text.Font font, BaseColor color)
        {
            var cell = new PdfPCell(new Paragraph(text, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE)))
            {
                BackgroundColor = new BaseColor(60, 60, 60), // Dark gray
                HorizontalAlignment = Element.ALIGN_CENTER,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 10,
                Border = iTextSharp.text.Rectangle.BOX,
                BorderColor = new BaseColor(200, 200, 200),
                BorderWidth = 1f
            };
            table.AddCell(cell);
        }

        private void AddTableCell(PdfPTable table, string text, iTextSharp.text.Font font)
        {
            var cell = new PdfPCell(new Paragraph(text ?? "N/A", font))
            {
                HorizontalAlignment = Element.ALIGN_LEFT,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 8,
                Border = iTextSharp.text.Rectangle.BOX,
                BorderColor = new BaseColor(200, 200, 200),
                BorderWidth = 0.5f,
                BackgroundColor = BaseColor.WHITE
            };
            table.AddCell(cell);
        }

        private iTextSharp.text.Image GenerateQRCode(string visitId)
        {
            try
            {
                _logger.LogInformation("Attempting to generate QR code for visit {VisitId}", visitId);

                // Create QR code generator
                var qrGenerator = new QRCodeGenerator();
                var qrCodeData = qrGenerator.CreateQrCode(visitId, QRCodeGenerator.ECCLevel.Q);

                _logger.LogInformation("QR code data generated successfully");

                // Create QR code as PNG bytes
                var qrCode = new PngByteQRCode(qrCodeData);
                var qrCodeBytes = qrCode.GetGraphic(20); // 20 pixels per module

                _logger.LogInformation("QR code PNG bytes generated successfully, byte array length: {Length}", qrCodeBytes.Length);

                // Convert to iTextSharp image
                var qrImage = iTextSharp.text.Image.GetInstance(qrCodeBytes);
                qrImage.ScaleToFit(80f, 80f);

                _logger.LogInformation("QR code image created successfully for iTextSharp");
                return qrImage;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating QR code for visit {VisitId}: {ErrorMessage}", visitId, ex.Message);
                return null; // Return null so calling code can handle fallback
            }
        }

        private iTextSharp.text.Image GenerateBarcode(string barcodeText)
        {
            try
            {
                _logger.LogInformation("Attempting to generate barcode for text {BarcodeText}", barcodeText);

                // Create barcode generator (Code128)
                var barcodeWriter = new ZXing.BarcodeWriterPixelData
                {
                    Format = ZXing.BarcodeFormat.CODE_128,
                    Options = new ZXing.Common.EncodingOptions
                    {
                        Height = 50,
                        Width = 200,
                        Margin = 2
                    }
                };

                var pixelData = barcodeWriter.Write(barcodeText);

                // Convert pixel data to byte array (PNG format)
                using (var bitmap = new System.Drawing.Bitmap(pixelData.Width, pixelData.Height, System.Drawing.Imaging.PixelFormat.Format32bppRgb))
                {
                    var bitmapData = bitmap.LockBits(new System.Drawing.Rectangle(0, 0, pixelData.Width, pixelData.Height),
                        System.Drawing.Imaging.ImageLockMode.WriteOnly, System.Drawing.Imaging.PixelFormat.Format32bppRgb);

                    try
                    {
                        System.Runtime.InteropServices.Marshal.Copy(pixelData.Pixels, 0, bitmapData.Scan0, pixelData.Pixels.Length);
                    }
                    finally
                    {
                        bitmap.UnlockBits(bitmapData);
                    }

                    using (var ms = new MemoryStream())
                    {
                        bitmap.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                        var barcodeBytes = ms.ToArray();

                        // Convert to iTextSharp image
                        var barcodeImage = iTextSharp.text.Image.GetInstance(barcodeBytes);
                        barcodeImage.ScaleToFit(120f, 30f);

                        _logger.LogInformation("Barcode image created successfully for iTextSharp");
                        return barcodeImage;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating barcode for text {BarcodeText}: {ErrorMessage}", barcodeText, ex.Message);
                return null; // Return null so calling code can handle fallback
            }
        }

        private async Task<AppointmentWithRelatedData?> GetAppointmentWithRelatedDataAsync(Guid appointmentId)
        {
            try
            {
                // Get appointment
                var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
                if (appointment == null)
                {
                    _logger.LogWarning("No appointment found for appointment ID {AppointmentId}", appointmentId);
                    return null;
                }

                // Get clinic data
                var clinic = appointment.ClinicId.HasValue ? await _clinicRepository.GetByIdAsync(appointment.ClinicId.Value) : null;

                // Get veterinarian data
                var veterinarian = appointment.VeterinarianId.HasValue ? await _userRepository.GetByIdAsync(appointment.VeterinarianId.Value) : null;

                return new AppointmentWithRelatedData
                {
                    AppointmentId = appointment.Id,
                    AppointmentDate = appointment.AppointmentDate,
                    ClinicName = clinic?.Name,
                    ClinicAddress = clinic?.AddressLine1,
                    ClinicCity = clinic?.City,
                    ClinicState = clinic?.State,
                    ClinicPhone = clinic?.Phone,
                    VeterinarianName = veterinarian != null ? $"{veterinarian.FirstName} {veterinarian.LastName}" : null,
                    VeterinarianEmail = veterinarian?.Email
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appointment data for appointment {AppointmentId}", appointmentId);
                return null;
            }
        }

        private class AppointmentWithRelatedData
        {
            public Guid AppointmentId { get; set; }
            public DateTime AppointmentDate { get; set; }
            public string? ClinicName { get; set; }
            public string? ClinicAddress { get; set; }
            public string? ClinicCity { get; set; }
            public string? ClinicState { get; set; }
            public string? ClinicPhone { get; set; }
            public string? VeterinarianName { get; set; }
            public string? VeterinarianEmail { get; set; }
        }
    }
}
