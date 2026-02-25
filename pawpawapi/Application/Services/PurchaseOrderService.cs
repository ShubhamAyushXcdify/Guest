using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Dapper;
using Microsoft.Extensions.Logging;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.IO;

namespace Application.Services
{
    public class PurchaseOrderService : IPurchaseOrderService
    {
        private readonly IPurchaseOrderRepository _purchaseOrderRepository;
        private readonly IPurchaseOrderItemRepository _purchaseOrderItemRepository;
        private readonly ISupplierRepository _supplierRepository;
        private readonly IInventoryService _inventoryService;
        private readonly IEmailService _emailService;
        private readonly IProductService _productService;
        private readonly IMapper _mapper;
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IPurchaseOrderReceivingHistoryRepository _receivingHistoryRepository;
        private readonly IClinicRepository _clinicRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<PurchaseOrderService> _logger;
        private readonly IClinicService _clinicService;
        private readonly BarcodeService _barcodeService;
        private readonly Infrastructure.Data.DapperDbContext _dbContext;

        public PurchaseOrderService(
            IPurchaseOrderRepository purchaseOrderRepository,
            IPurchaseOrderItemRepository purchaseOrderItemRepository,
            ISupplierRepository supplierRepository,
            IInventoryService inventoryService,
            IEmailService emailService,
            IProductService productService,
            IMapper mapper,
            IInventoryRepository inventoryRepository,
            IPurchaseOrderReceivingHistoryRepository receivingHistoryRepository,
            IClinicRepository clinicRepository,
            IUserRepository userRepository,
            ILogger<PurchaseOrderService> logger,
            IClinicService clinicService,
            BarcodeService barcodeService,
            Infrastructure.Data.DapperDbContext dbContext)
        {
            _purchaseOrderRepository = purchaseOrderRepository;
            _purchaseOrderItemRepository = purchaseOrderItemRepository;
            _supplierRepository = supplierRepository;
            _inventoryService = inventoryService;
            _emailService = emailService;
            _productService = productService;
            _mapper = mapper;
            _inventoryRepository = inventoryRepository;
            _receivingHistoryRepository = receivingHistoryRepository;
            _clinicRepository = clinicRepository;
            _userRepository = userRepository;
            _logger = logger;
            _clinicService = clinicService;
            _barcodeService = barcodeService;
            _dbContext = dbContext;
        }

        public async Task<PurchaseOrderResponseDto?> GetByIdAsync(Guid id)
        {
            var order = await _purchaseOrderRepository.GetByIdAsync(id);
            if (order == null) return null;

            var response = _mapper.Map<PurchaseOrderResponseDto>(order);
            
            // Get items
            var items = await _purchaseOrderItemRepository.GetByPurchaseOrderIdAsync(id);
            var itemDtos = _mapper.Map<List<PurchaseOrderItemResponseDto>>(items);
            
            // Get product details for each item
            foreach (var itemDto in itemDtos)
            {
                if (itemDto.ProductId.HasValue)
                {
                    var product = await _productService.GetByIdAsync(itemDto.ProductId.Value);
                    if (product != null)
                    {
                        itemDto.Product = _mapper.Map<ProductDto>(product);
                    }
                }
            }
            
            response.Items = itemDtos;
            
            // Get received items (batch-wise)
            var receivedItems = await _receivingHistoryRepository.GetByPurchaseOrderIdAsync(id);
            var receivedItemDtos = new List<PurchaseOrderReceivingHistoryResponseDto>();
            
            foreach (var receivedItem in receivedItems)
            {
                var receivedItemDto = _mapper.Map<PurchaseOrderReceivingHistoryResponseDto>(receivedItem);
                
                // Populate additional details
                if (receivedItem.ClinicId != Guid.Empty)
                {
                    var clinic = await _clinicRepository.GetByIdAsync(receivedItem.ClinicId);
                    receivedItemDto.ClinicName = clinic?.Name;
                }
                
                if (receivedItem.ReceivedBy.HasValue)
                {
                    var user = await _userRepository.GetByIdAsync(receivedItem.ReceivedBy.Value);
                    receivedItemDto.ReceivedByName = user?.FirstName + " " + user?.LastName;
                }
                
                if (receivedItem.SupplierId.HasValue)
                {
                    var supplier = await _supplierRepository.GetByIdAsync(receivedItem.SupplierId.Value);
                    receivedItemDto.SupplierName = supplier?.Name;
                }
                
                // Get order number
                receivedItemDto.OrderNumber = order.OrderNumber;
                
                // Get product name
                if (receivedItem.ProductId != Guid.Empty)
                {
                    var product = await _productService.GetByIdAsync(receivedItem.ProductId);
                    receivedItemDto.ProductName = product?.Name;
                }
                
                receivedItemDtos.Add(receivedItemDto);
            }
            
            response.ReceivedItems = receivedItemDtos;
            
            // Get supplier details if supplier ID exists
            if (order.SupplierId.HasValue)
            {
                var supplier = await _supplierRepository.GetByIdAsync(order.SupplierId.Value);
                if (supplier != null)
                {
                    response.Supplier = _mapper.Map<SupplierDto>(supplier);
                }
            }
            
            if (order.PdfData != null)
                response.PdfBase64 = Convert.ToBase64String(order.PdfData);

            return response;
        }

        public async Task<IEnumerable<PurchaseOrderResponseDto>> GetAllAsync(
            Guid? clinicId = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            Guid? supplierId = null,
            IEnumerable<string>? status = null,
            string? orderNumber = null,
            Guid? createdBy = null,
            DateTime? expectedDeliveryFrom = null,
            DateTime? expectedDeliveryTo = null,
            DateTime? actualDeliveryFrom = null,
            DateTime? actualDeliveryTo = null)
        {
            var orders = await _purchaseOrderRepository.GetAllAsync(
                clinicId,
                dateFrom,
                dateTo,
                supplierId,
                status,
                orderNumber,
                createdBy,
                expectedDeliveryFrom,
                expectedDeliveryTo,
                actualDeliveryFrom,
                actualDeliveryTo);
            var response = new List<PurchaseOrderResponseDto>();

            foreach (var order in orders)
            {
                var orderDto = _mapper.Map<PurchaseOrderResponseDto>(order);

                // Get items
                var items = await _purchaseOrderItemRepository.GetByPurchaseOrderIdAsync(order.Id);
                var itemDtos = _mapper.Map<List<PurchaseOrderItemResponseDto>>(items);

                // Get product details for each item
                foreach (var itemDto in itemDtos)
                {
                    if (itemDto.ProductId.HasValue)
                    {
                        var product = await _productService.GetByIdAsync(itemDto.ProductId.Value);
                        if (product != null)
                        {
                            itemDto.Product = _mapper.Map<ProductDto>(product);
                        }
                    }
                }

                orderDto.Items = itemDtos;

                // Get supplier details if supplier ID exists
                if (order.SupplierId.HasValue)
                {
                    var supplier = await _supplierRepository.GetByIdAsync(order.SupplierId.Value);
                    if (supplier != null)
                    {
                        orderDto.Supplier = _mapper.Map<SupplierDto>(supplier);
                    }
                }

                response.Add(orderDto);
            }

            return response;
        }


        public async Task<PaginatedResponse<PurchaseOrderResponseDto>> GetAllPagedAsync(
        Guid? clinicId = null,
        DateTime? dateFrom = null,
        DateTime? dateTo = null,
        Guid? supplierId = null,
        IEnumerable<string>? status = null,
        string? orderNumber = null,
        Guid? createdBy = null,
        DateTime? expectedDeliveryFrom = null,
        DateTime? expectedDeliveryTo = null,
        DateTime? actualDeliveryFrom = null,
        DateTime? actualDeliveryTo = null,
        int page = 1,
        int pageSize = 10)
        {
            var paged = await _purchaseOrderRepository.GetAllPagedAsync(
                clinicId, dateFrom, dateTo, supplierId, status, orderNumber, createdBy,
                expectedDeliveryFrom, expectedDeliveryTo, actualDeliveryFrom, actualDeliveryTo,
                page, pageSize);

            var dtoList = new List<PurchaseOrderResponseDto>();

            foreach (var order in paged.Data)
            {
                var orderDto = _mapper.Map<PurchaseOrderResponseDto>(order);

                var items = await _purchaseOrderItemRepository.GetByPurchaseOrderIdAsync(order.Id);
                var itemDtos = _mapper.Map<List<PurchaseOrderItemResponseDto>>(items);

                foreach (var itemDto in itemDtos)
                {
                    if (itemDto.ProductId.HasValue)
                    {
                        var product = await _productService.GetByIdAsync(itemDto.ProductId.Value);
                        if (product != null)
                        {
                            itemDto.Product = _mapper.Map<ProductDto>(product);
                        }
                    }
                }

                orderDto.Items = itemDtos;

                if (order.SupplierId.HasValue)
                {
                    var supplier = await _supplierRepository.GetByIdAsync(order.SupplierId.Value);
                    if (supplier != null)
                    {
                        orderDto.Supplier = _mapper.Map<SupplierDto>(supplier);
                    }
                }

                dtoList.Add(orderDto);
            }

            return new PaginatedResponse<PurchaseOrderResponseDto>
            {
                Data = dtoList,
                Meta = paged.Meta // copy pagination info straight through
            };
        }
        public async Task<PurchaseOrderResponseDto> CreateAsync(CreatePurchaseOrderRequestDto dto)
        {
            // Generate order number and set order date
            var orderNumber = await _purchaseOrderRepository.GenerateOrderNumberAsync();
            var orderDate = DateTime.Today;

            // Create purchase order
            var order = _mapper.Map<PurchaseOrder>(dto);
            order.Id = Guid.NewGuid();
            order.OrderNumber = orderNumber;
            order.OrderDate = orderDate;
            order.Status = dto.Status ?? "pending";
            order.CreatedAt = DateTimeOffset.UtcNow;
            order.UpdatedAt = DateTimeOffset.UtcNow;

            // Calculate totals from items
            CalculateOrderTotals(order, dto.Items);

            await _purchaseOrderRepository.AddAsync(order);

            // Create purchase order items
            if (dto.Items != null && dto.Items.Any())
            {
                foreach (var itemDto in dto.Items)
                {
                    var item = _mapper.Map<PurchaseOrderItem>(itemDto);
                    item.Id = Guid.NewGuid();
                    item.PurchaseOrderId = order.Id;
                    item.QuantityReceived = 0; // Initialize to 0 for receiving
                    item.CreatedAt = DateTimeOffset.UtcNow;
                    item.UpdatedAt = DateTimeOffset.UtcNow;
                    
                    // Calculate item totals
                    CalculateItemTotals(item);
                    
                    await _purchaseOrderItemRepository.AddAsync(item);
                }
            }

            // Fetch supplier email and send notification
            if (order.SupplierId.HasValue)
            {
                try
                {
                    var supplier = await _supplierRepository.GetByIdAsync(order.SupplierId.Value);
                    if (supplier != null && !string.IsNullOrEmpty(supplier.Email))
                    {
                        // Get clinic information for the PDF
                        ClinicResponseDto clinic = null;
                        if (order.ClinicId.HasValue)
                        {
                            var clinicEntity = await _clinicService.GetByIdAsync(order.ClinicId.Value);
                            if (clinicEntity != null)
                            {
                                clinic = clinicEntity;
                            }
                        }

                        var clinicName = clinic?.Name ?? "Paw Track Veterinary Clinic";
                        var subject = $"New Purchase Order: {order.OrderNumber} - {clinicName}";

                        // Build detailed email body with product information
                        var body = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #2c5aa0; margin-bottom: 10px;'>{clinicName}</h1>
            <h2 style='color: #333; margin-top: 0;'>New Purchase Order</h2>
        </div>
        
        <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;'>
            <p>Dear {supplier.Name},</p>
            
            <p>A new purchase order has been placed with your company. Please find the details below:</p>
            
            <div style='background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;'>
                <h3 style='color: #2c5aa0; margin-top: 0;'>Order Information</h3>
                <p><strong>Order Number:</strong> {order.OrderNumber}</p>
                <p><strong>Order Date:</strong> {order.OrderDate:dddd, MMMM dd, yyyy}</p>
                <p><strong>Expected Delivery Date:</strong> {(order.ExpectedDeliveryDate?.ToString("dddd, MMMM dd, yyyy") ?? "Not specified")}</p>
                <p><strong>Total Amount:</strong> ${order.TotalAmount:F2}</p>
                {(order.DiscountPercentage > 0 ? $"<p><strong>Discount:</strong> {order.DiscountPercentage:F1}%</p>" : "")}
                {(order.DiscountedAmount > 0 ? $"<p><strong>Discounted Amount:</strong> ${order.DiscountedAmount:F2}</p>" : "")}
            </div>
            
            <div style='background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;'>
                <h3 style='color: #2c5aa0; margin-top: 0;'>Order Items</h3>
                <table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>
                    <thead>
                        <tr style='background-color: #f8f9fa;'>
                            <th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Product</th>
                            <th style='border: 1px solid #ddd; padding: 8px; text-align: center;'>Quantity</th>
                            <th style='border: 1px solid #ddd; padding: 8px; text-align: right;'>Unit Cost</th>
                            <th style='border: 1px solid #ddd; padding: 8px; text-align: right;'>Total</th>
                        </tr>
                    </thead>
                    <tbody>";

                        // Add each item to the table
                        foreach (var item in dto.Items)
                        {
                            var product = await _productService.GetByIdAsync(item.ProductId);
                            var productName = product?.Name ?? $"Product ID: {item.ProductId}";
                            var unitCost = item.UnitCost ?? 0;
                            var totalCost = unitCost * item.QuantityOrdered;
                            
                            body += $@"
                        <tr>
                            <td style='border: 1px solid #ddd; padding: 8px;'>{productName}</td>
                            <td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>{item.QuantityOrdered}</td>
                            <td style='border: 1px solid #ddd; padding: 8px; text-align: right;'>${unitCost:F2}</td>
                            <td style='border: 1px solid #ddd; padding: 8px; text-align: right;'>${totalCost:F2}</td>
                        </tr>";
                        }

                        body += $@"
                    </tbody>
                </table>
            </div>";

                        // Add notes if available
                        if (!string.IsNullOrEmpty(order.Notes))
                        {
                            body += $@"
            <div style='background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;'>
                <h3 style='color: #2c5aa0; margin-top: 0;'>Additional Notes</h3>
                <p>{order.Notes}</p>
            </div>";
                        }

                        body += $@"
            <p>Please find the attached purchase order PDF for your records.</p>
            
            <p>Please process this order and confirm receipt. If you have any questions or need clarification, please contact us immediately.</p>
            
            <p>We look forward to receiving the items as specified.</p>
            
            <p>Best regards,<br/>
            <strong>The {clinicName} Team</strong></p>
        </div>
        
        <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;'>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>For questions or concerns, please contact us directly.</p>
        </div>
    </div>
</body>
</html>";

                        // Generate PDF attachment
                        var pdfData = await GeneratePurchaseOrderPdfAsync(order, dto.Items, _mapper.Map<SupplierResponseDto>(supplier), clinic);
                        var attachmentName = $"PurchaseOrder_{order.OrderNumber}.pdf";

                        // Send email with PDF attachment
                        await _emailService.SendEmailWithAttachmentAsync(supplier.Email, subject, body, pdfData, attachmentName);
                        // Store PDF in DB
                        order.PdfData = pdfData;
                        await _purchaseOrderRepository.UpdateAsync(order);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send email notification for purchase order {OrderNumber}", order.OrderNumber);
                }
            }

            return await GetByIdAsync(order.Id);
        }

        private async Task<byte[]> GeneratePurchaseOrderPdfAsync(PurchaseOrder order, List<CreatePurchaseOrderItemRequestDto> items, SupplierResponseDto supplier, ClinicResponseDto clinic)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                Document document = new Document(PageSize.A4, 40, 40, 40, 40);
                PdfWriter writer = PdfWriter.GetInstance(document, ms);
                document.Open();

                // Define colors (removed green and yellow as per request)
                // BaseColor greenColor = new BaseColor(34, 139, 34); // Forest Green
                // BaseColor lightGreenColor = new BaseColor(144, 238, 144); // Light Green
                // BaseColor yellowColor = new BaseColor(255, 255, 0); // Yellow
                // BaseColor darkGreenColor = new BaseColor(0, 100, 0); // Dark Green

                // Header Section
                PdfPTable headerTable = new PdfPTable(2);
                headerTable.WidthPercentage = 100;
                headerTable.SetWidths(new float[] { 1f, 1f });
                headerTable.SpacingBefore = 10f;

                // Left side - Company Info (GimBooks section removed)
                PdfPCell leftCell = new PdfPCell();
                leftCell.Border = Rectangle.NO_BORDER;
                leftCell.PaddingBottom = 10f;

                // Right side - Purchase Order Title
                PdfPCell rightCell = new PdfPCell();
                rightCell.Border = Rectangle.NO_BORDER;
                rightCell.HorizontalAlignment = Element.ALIGN_RIGHT;
                rightCell.VerticalAlignment = Element.ALIGN_TOP;

                Font titleFont = new Font(Font.FontFamily.HELVETICA, 26, Font.BOLD, BaseColor.BLACK); // Changed to black
                Paragraph title = new Paragraph("PURCHASE ORDER", titleFont);
                title.Alignment = Element.ALIGN_RIGHT;
                rightCell.AddElement(title);

                Font dateFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL, BaseColor.BLACK);
                Paragraph dateText = new Paragraph($"DATE {order.OrderDate:dd-MM-yyyy}", dateFont);
                dateText.Alignment = Element.ALIGN_RIGHT;
                rightCell.AddElement(dateText);

                Paragraph poNumber = new Paragraph($"PO # {order.OrderNumber}", dateFont);
                poNumber.Alignment = Element.ALIGN_RIGHT;
                rightCell.AddElement(poNumber);

                headerTable.AddCell(leftCell);
                headerTable.AddCell(rightCell);
                document.Add(headerTable);

                // Add some spacing
                document.Add(new Paragraph(" ", new Font(Font.FontFamily.HELVETICA, 12)) { SpacingAfter = 15f });

                // Vendor and Ship To Section
                PdfPTable vendorShipTable = new PdfPTable(2);
                vendorShipTable.WidthPercentage = 100;
                vendorShipTable.SetWidths(new float[] { 1f, 1f });
                vendorShipTable.SpacingAfter = 15f;

                // Vendor Section
                PdfPCell vendorCell = new PdfPCell();
                vendorCell.BackgroundColor = BaseColor.WHITE; // Removed background color
                vendorCell.Padding = 8f;
                vendorCell.Border = Rectangle.BOX;
                vendorCell.BorderColor = BaseColor.BLACK; // Changed border color to black

                Font sectionFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLACK); // Changed font color to black
                Paragraph vendorTitle = new Paragraph("VENDOR", sectionFont);
                vendorCell.AddElement(vendorTitle);

                Font infoFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.BLACK);
                vendorCell.AddElement(new Paragraph(supplier?.Name ?? "[Company Name]", infoFont));
                vendorCell.AddElement(new Paragraph(supplier?.ContactPerson ?? "[Contact or Department]", infoFont));
                
                // Combine address lines for supplier
                var supplierAddress = !string.IsNullOrEmpty(supplier?.AddressLine1) ? supplier.AddressLine1 : "[Street Address]";
                vendorCell.AddElement(new Paragraph(supplierAddress, infoFont));
                
                var supplierCityState = !string.IsNullOrEmpty(supplier?.City) ? 
                    $"{supplier.City}{(string.IsNullOrEmpty(supplier.State) ? "" : $", {supplier.State}")}" : 
                    "[City, ST ZIP]";
                vendorCell.AddElement(new Paragraph(supplierCityState, infoFont));
                vendorCell.AddElement(new Paragraph($"Phone: {supplier?.Phone ?? "(000) 000-0000"}", infoFont));
               

                // Ship To Section
                PdfPCell shipToCell = new PdfPCell();
                shipToCell.BackgroundColor = BaseColor.WHITE; // Removed background color
                shipToCell.Padding = 8f;
                shipToCell.Border = Rectangle.BOX;
                shipToCell.BorderColor = BaseColor.BLACK; // Changed border color to black

                Paragraph shipToTitle = new Paragraph("SHIP TO", sectionFont);
                shipToCell.AddElement(shipToTitle);

                shipToCell.AddElement(new Paragraph(clinic?.Name ?? "[Name]", infoFont));
                shipToCell.AddElement(new Paragraph(clinic?.Name ?? "[Company Name]", infoFont));
                
                // Combine address lines for clinic
                var clinicAddress = !string.IsNullOrEmpty(clinic?.AddressLine1) ? clinic.AddressLine1 : "[Street Address]";
                shipToCell.AddElement(new Paragraph(clinicAddress, infoFont));
                
                var clinicCityState = !string.IsNullOrEmpty(clinic?.City) ? 
                    $"{clinic.City}{(string.IsNullOrEmpty(clinic.State) ? "" : $", {clinic.State}")}" : 
                    "[City, ST ZIP]";
                shipToCell.AddElement(new Paragraph(clinicCityState, infoFont));
                shipToCell.AddElement(new Paragraph($"Phone: {clinic?.Phone ?? ""}", infoFont));

                vendorShipTable.AddCell(vendorCell);
                vendorShipTable.AddCell(shipToCell);
                document.Add(vendorShipTable);

                // Add some spacing
                document.Add(new Paragraph(" ", new Font(Font.FontFamily.HELVETICA, 12)) { SpacingAfter = 15f });

                // Item Details Table
                PdfPTable itemTable = new PdfPTable(5);
                itemTable.WidthPercentage = 100;
                itemTable.SetWidths(new float[] { 0.8f, 2.5f, 0.8f, 1f, 1f });
                itemTable.SpacingAfter = 20f;

                // Table Header
                string[] headers = { "ITEM #", "DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL" };
                foreach (string header in headers)
                {
                    PdfPCell cell = new PdfPCell(new Paragraph(header, sectionFont));
                    cell.BackgroundColor = BaseColor.WHITE; // Removed background color
                    cell.Padding = 8f;
                    cell.HorizontalAlignment = Element.ALIGN_CENTER;
                    cell.Border = Rectangle.BOX;
                    cell.BorderColor = BaseColor.BLACK; // Changed border color to black
                    itemTable.AddCell(cell);
                }

                // Add items
                int itemNumber = 1;
                foreach (var item in items)
                {
                    var product = await _productService.GetByIdAsync(item.ProductId);
                    var productName = product?.Name ?? $"Product ID: {item.ProductId}";
                    var unitCost = item.UnitCost ?? 0;
                    var totalCost = unitCost * item.QuantityOrdered;

                    itemTable.AddCell(new PdfPCell(new Paragraph(itemNumber.ToString(), infoFont)) { Padding = 8f, Border = Rectangle.BOX, BorderColor = BaseColor.BLACK });
                    itemTable.AddCell(new PdfPCell(new Paragraph(productName, infoFont)) { Padding = 8f, Border = Rectangle.BOX, BorderColor = BaseColor.BLACK });
                    itemTable.AddCell(new PdfPCell(new Paragraph(item.QuantityOrdered.ToString(), infoFont)) { Padding = 8f, HorizontalAlignment = Element.ALIGN_CENTER, Border = Rectangle.BOX, BorderColor = BaseColor.BLACK });
                    itemTable.AddCell(new PdfPCell(new Paragraph($"₹{unitCost:F2}", infoFont)) { Padding = 8f, HorizontalAlignment = Element.ALIGN_RIGHT, Border = Rectangle.BOX, BorderColor = BaseColor.BLACK }); // Changed $ to ₹
                    itemTable.AddCell(new PdfPCell(new Paragraph($"₹{totalCost:F2}", infoFont)) { Padding = 8f, HorizontalAlignment = Element.ALIGN_RIGHT, Border = Rectangle.BOX, BorderColor = BaseColor.BLACK }); // Changed $ to ₹
                    itemNumber++;
                }

                // Add empty rows for additional items (reduced from 5 to 3 for cleaner look)
                for (int i = 0; i < 3; i++)
                {
                    itemTable.AddCell(new PdfPCell(new Paragraph("", infoFont)) { Padding = 8f, Border = Rectangle.BOX, BorderColor = BaseColor.BLACK });
                    itemTable.AddCell(new PdfPCell(new Paragraph("", infoFont)) { Padding = 8f, Border = Rectangle.BOX, BorderColor = BaseColor.BLACK });
                    itemTable.AddCell(new PdfPCell(new Paragraph("", infoFont)) { Padding = 8f, Border = Rectangle.BOX, BorderColor = BaseColor.BLACK });
                    itemTable.AddCell(new PdfPCell(new Paragraph("", infoFont)) { Padding = 8f, Border = Rectangle.BOX, BorderColor = BaseColor.BLACK });
                    itemTable.AddCell(new PdfPCell(new Paragraph("", infoFont)) { Padding = 8f, Border = Rectangle.BOX, BorderColor = BaseColor.BLACK });
                }

                document.Add(itemTable);

                // Summary and Totals Section
                PdfPTable summaryTable = new PdfPTable(2);
                summaryTable.WidthPercentage = 35;
                summaryTable.SetWidths(new float[] { 1f, 1f });
                summaryTable.HorizontalAlignment = Element.ALIGN_RIGHT;
                summaryTable.SpacingAfter = 20f;

                summaryTable.AddCell(new PdfPCell(new Paragraph("SUBTOTAL", infoFont)) { Border = Rectangle.NO_BORDER, Padding = 5f });
                summaryTable.AddCell(new PdfPCell(new Paragraph($"₹{order.TotalAmount:F2}", infoFont)) { Border = Rectangle.NO_BORDER, Padding = 5f, HorizontalAlignment = Element.ALIGN_RIGHT }); // Changed $ to ₹

                summaryTable.AddCell(new PdfPCell(new Paragraph("TAX", infoFont)) { Border = Rectangle.NO_BORDER, Padding = 5f });
                summaryTable.AddCell(new PdfPCell(new Paragraph("₹0.00", infoFont)) { Border = Rectangle.NO_BORDER, Padding = 5f, HorizontalAlignment = Element.ALIGN_RIGHT }); // Changed $ to ₹

                summaryTable.AddCell(new PdfPCell(new Paragraph("SHIPPING", infoFont)) { Border = Rectangle.NO_BORDER, Padding = 5f });
                summaryTable.AddCell(new PdfPCell(new Paragraph("₹0.00", infoFont)) { Border = Rectangle.NO_BORDER, Padding = 5f, HorizontalAlignment = Element.ALIGN_RIGHT }); // Changed $ to ₹

                summaryTable.AddCell(new PdfPCell(new Paragraph("OTHER", infoFont)) { Border = Rectangle.NO_BORDER, Padding = 5f });
                summaryTable.AddCell(new PdfPCell(new Paragraph("₹0.00", infoFont)) { Border = Rectangle.NO_BORDER, Padding = 5f, HorizontalAlignment = Element.ALIGN_RIGHT }); // Changed $ to ₹

                // Total row with white background and black border
                PdfPCell totalLabelCell = new PdfPCell(new Paragraph("TOTAL", new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLACK)));
                totalLabelCell.BackgroundColor = BaseColor.WHITE; // Removed yellow background
                totalLabelCell.Border = Rectangle.BOX;
                totalLabelCell.BorderColor = BaseColor.BLACK; // Changed border color to black
                totalLabelCell.Padding = 8f;

                PdfPCell totalValueCell = new PdfPCell(new Paragraph($"₹{order.TotalAmount:F2}", new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLACK))); // Changed $ to ₹
                totalValueCell.BackgroundColor = BaseColor.WHITE; // Removed yellow background
                totalValueCell.Border = Rectangle.BOX;
                totalValueCell.BorderColor = BaseColor.BLACK; // Changed border color to black
                totalValueCell.Padding = 8f;
                totalValueCell.HorizontalAlignment = Element.ALIGN_RIGHT;

                summaryTable.AddCell(totalLabelCell);
                summaryTable.AddCell(totalValueCell);

                document.Add(summaryTable);

                // Footer (replaced with custom note)
                Paragraph footer = new Paragraph("This PDF is autogenerated. For your query, please contact the office directly.", new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, BaseColor.BLACK));
                footer.Alignment = Element.ALIGN_CENTER;
                footer.SpacingBefore = 30f;
                document.Add(footer);

                document.Close();
                return ms.ToArray();
            }
        }

        public async Task<PurchaseOrderResponseDto> UpdateAsync(UpdatePurchaseOrderRequestDto dto)
        {
            var existingOrder = await _purchaseOrderRepository.GetByIdAsync(dto.Id);
            if (existingOrder == null)
                throw new InvalidOperationException("Purchase order not found");

            // Update purchase order
            var order = _mapper.Map<PurchaseOrder>(dto);
            order.OrderNumber = existingOrder.OrderNumber; // Preserve order number
            order.OrderDate = existingOrder.OrderDate; // Preserve order date
            order.UpdatedAt = DateTimeOffset.UtcNow;

            // Calculate totals from items
            CalculateOrderTotals(order, dto.Items);

            await _purchaseOrderRepository.UpdateAsync(order);

            // Delete existing items and create new ones
            await _purchaseOrderItemRepository.DeleteByPurchaseOrderIdAsync(dto.Id);

            if (dto.Items != null && dto.Items.Any())
            {
                foreach (var itemDto in dto.Items)
                {
                    var item = _mapper.Map<PurchaseOrderItem>(itemDto);
                    item.Id = Guid.NewGuid();
                    item.PurchaseOrderId = order.Id;
                    item.QuantityReceived = 0; // Initialize to 0 for receiving
                    item.CreatedAt = DateTimeOffset.UtcNow;
                    item.UpdatedAt = DateTimeOffset.UtcNow;
                    
                    // Calculate item totals
                    CalculateItemTotals(item);
                    
                    await _purchaseOrderItemRepository.AddAsync(item);
                }
            }

            return await GetByIdAsync(order.Id);
        }

        public async Task DeleteAsync(Guid id)
        {
            // Check if any prescriptions reference receiving history from this purchase order
            var receivingHistories = await _receivingHistoryRepository.GetByPurchaseOrderIdAsync(id);
            if (receivingHistories.Any())
            {
                // Check if any prescription mappings reference these receiving histories
                var receivingHistoryIds = receivingHistories.Select(rh => rh.Id).ToList();

                // We need to check if any prescription_product_mapping records reference these receiving histories
                // This requires a new method in the repository or a direct check
                var hasAssociatedPrescriptions = await CheckForAssociatedPrescriptionsAsync(receivingHistoryIds);

                if (hasAssociatedPrescriptions)
                {
                    throw new InvalidOperationException(
                        "Cannot delete purchase order because it has receiving history records that are referenced by prescriptions. " +
                        "Please remove the prescription references first or contact an administrator.");
                }
            }

            // Delete items first (due to foreign key constraint)
            await _purchaseOrderItemRepository.DeleteByPurchaseOrderIdAsync(id);
            await _purchaseOrderRepository.DeleteAsync(id);
        }

        private async Task<bool> CheckForAssociatedPrescriptionsAsync(List<Guid> receivingHistoryIds)
        {
            if (!receivingHistoryIds.Any())
                return false;

            try
            {
                // Use a simple query to check if any prescription mappings reference these receiving histories
                using var connection = await _dbContext.CreateConnectionAsync();
                var sql = @"
                    SELECT COUNT(1)
                    FROM prescription_product_mapping
                    WHERE purchase_order_receiving_history_id = ANY(@ReceivingHistoryIds)";

                var count = await connection.ExecuteScalarAsync<int>(sql, new { ReceivingHistoryIds = receivingHistoryIds.ToArray() });
                return count > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking for associated prescriptions for receiving history IDs: {ReceivingHistoryIds}",
                    string.Join(", ", receivingHistoryIds));
                // If we can't check, assume there are associations to be safe
                return true;
            }
        }

        public async Task<IEnumerable<PurchaseOrderItemResponseDto>> GetItemsByPurchaseOrderIdAsync(Guid purchaseOrderId)
        {
            var items = await _purchaseOrderItemRepository.GetByPurchaseOrderIdAsync(purchaseOrderId);
            var itemDtos = _mapper.Map<List<PurchaseOrderItemResponseDto>>(items);
            
            // Get product details for each item
            foreach (var itemDto in itemDtos)
            {
                if (itemDto.ProductId.HasValue)
                {
                    var product = await _productService.GetByIdAsync(itemDto.ProductId.Value);
                    if (product != null)
                    {
                        itemDto.Product = _mapper.Map<ProductDto>(product);
                    }
                }
            }
            
            return itemDtos;
        }

        public async Task<PurchaseOrderItemResponseDto?> GetItemByIdAsync(Guid itemId)
        {
            var item = await _purchaseOrderItemRepository.GetByIdAsync(itemId);
            if (item == null) return null;

            var itemDto = _mapper.Map<PurchaseOrderItemResponseDto>(item);

            // Get product details
            if (itemDto.ProductId.HasValue)
            {
                var product = await _productService.GetByIdAsync(itemDto.ProductId.Value);
                if (product != null)
                {
                    itemDto.Product = _mapper.Map<ProductDto>(product);
                }
            }

            return itemDto;
        }

        // Receiving methods
        public async Task<IEnumerable<PurchaseOrderResponseDto>> GetPendingReceivingAsync()
        {
            var orders = await _purchaseOrderRepository.GetPendingReceivingAsync();
            var response = new List<PurchaseOrderResponseDto>();

            foreach (var order in orders)
            {
                var orderDto = _mapper.Map<PurchaseOrderResponseDto>(order);
                var items = await _purchaseOrderItemRepository.GetByPurchaseOrderIdAsync(order.Id);
                orderDto.Items = _mapper.Map<List<PurchaseOrderItemResponseDto>>(items);
                response.Add(orderDto);
            }

            return response;
        }

        public async Task<PurchaseOrderResponseDto?> GetByOrderNumberAsync(string orderNumber)
        {
            var order = await _purchaseOrderRepository.GetByOrderNumberAsync(orderNumber);
            if (order == null) return null;

            var response = _mapper.Map<PurchaseOrderResponseDto>(order);
            var items = await _purchaseOrderItemRepository.GetByPurchaseOrderIdAsync(order.Id);
            response.Items = _mapper.Map<List<PurchaseOrderItemResponseDto>>(items);
            
            return response;
        }

        public async Task<PurchaseOrderResponseDto> ReceiveItemsAsync(ReceivePurchaseOrderRequestDto dto)
        {
            var order = await _purchaseOrderRepository.GetByIdAsync(dto.PurchaseOrderId);
            if (order == null)
                throw new InvalidOperationException("Purchase order not found");

            if (order.Status != "ordered" && order.Status != "partial")
                throw new InvalidOperationException("Purchase order is not in a state that can be received");

            var receivedDate = DateTime.Today;
            var updatedAt = DateTimeOffset.UtcNow;

            // Update purchase order
            order.ActualDeliveryDate = receivedDate;
            order.UpdatedAt = updatedAt;

            // Update items and inventory
            foreach (var receivedItem in dto.ReceivedItems)
            {
                var item = await _purchaseOrderItemRepository.GetByIdAsync(receivedItem.PurchaseOrderItemId);
                if (item == null)
                    throw new InvalidOperationException($"Purchase order item not found: {receivedItem.PurchaseOrderItemId}");

                if (item.PurchaseOrderId != order.Id)
                    throw new InvalidOperationException("Item does not belong to this purchase order");

                // Validate that batches are provided
                if (receivedItem.Batches == null || !receivedItem.Batches.Any())
                    throw new InvalidOperationException($"At least one batch is required for item {receivedItem.PurchaseOrderItemId}");

                // Calculate total quantity received across all batches
                var totalQuantityReceived = receivedItem.Batches.Sum(b => b.QuantityReceived);
                var currentReceived = item.QuantityReceived ?? 0;
                var newTotalReceived = currentReceived + totalQuantityReceived;

                if (newTotalReceived > item.QuantityOrdered)
                    throw new InvalidOperationException($"Cannot receive more than ordered quantity for item {item.Id}. Ordered: {item.QuantityOrdered}, Already received: {currentReceived}, Trying to receive: {totalQuantityReceived}");

                // Update item quantity (we'll use the first batch for item-level details for backward compatibility)
                var firstBatch = receivedItem.Batches.First();
                item.QuantityReceived = newTotalReceived;
                item.BatchNumber = firstBatch.BatchNumber; // Store first batch number for backward compatibility
                item.BarcodeNumber = firstBatch.BarcodeNumber;
                item.ExpirationDate = firstBatch.ExpiryDate;
                item.DateOfManufacture = firstBatch.DateOfManufacture;
                item.ActualDeliveryDate = receivedDate;
                item.ReceivedBy = dto.ReceivedBy;
                item.UpdatedAt = updatedAt;

                await _purchaseOrderItemRepository.UpdateAsync(item);

                // Check for duplicate batch numbers within the same product and clinic
                var batchNumbers = receivedItem.Batches.Select(b => b.BatchNumber).Where(b => !string.IsNullOrWhiteSpace(b)).ToList();
                var duplicateBatches = batchNumbers.GroupBy(b => b).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
                if (duplicateBatches.Any())
                {
                    throw new InvalidOperationException($"Duplicate batch numbers found in the request: {string.Join(", ", duplicateBatches)}. Each batch number must be unique within the same product.");
                }

                // Check for existing batch numbers in the database for this product and clinic
                if (order.ClinicId.HasValue)
                {
                    foreach (var batch in receivedItem.Batches)
                    {
                        if (!string.IsNullOrWhiteSpace(batch.BatchNumber))
                        {
                            var existingBatch = await _receivingHistoryRepository.GetByProductAndBatchAsync(
                                receivedItem.ProductId, order.ClinicId.Value, batch.BatchNumber);
                            if (existingBatch != null)
                            {
                                throw new InvalidOperationException($"The given batch number '{batch.BatchNumber}' already exists for this product in this clinic.");
                            }
                        }
                    }
                }

                // Process each batch separately
                foreach (var batch in receivedItem.Batches)
                {
                    // Validate batch data
                    if (batch.QuantityReceived <= 0)
                        throw new InvalidOperationException($"Batch quantity must be greater than 0 for batch {batch.BatchNumber}");
                    // Batch number optional

                    // Calculate current quantity in hand for this specific batch
                    int currentQuantityInHand = 0;
                    if (order.ClinicId.HasValue && receivedItem.ProductId != Guid.Empty)
                    {
                        var existingInventory = await _inventoryRepository.GetByProductAndBatchRangeAsync(
                            receivedItem.ProductId, order.ClinicId.Value, item.LotNumber, batch.BatchNumber);
                        if (existingInventory != null && existingInventory.Any())
                        {
                            currentQuantityInHand = existingInventory.Sum(i => i.QuantityOnHand);
                        }
                    }

                    // Generate unique barcode for this batch
                    var barcode = _barcodeService.GenerateUniqueBarcode(order.Id, receivedItem.ProductId, batch.BatchNumber ?? string.Empty);

                    // Store receiving history for each batch
                    var receivingHistory = new PurchaseOrderReceivingHistory
                    {
                        Id = Guid.NewGuid(),
                        PurchaseOrderId = order.Id,
                        PurchaseOrderItemId = item.Id,
                        ProductId = receivedItem.ProductId,
                        ClinicId = order.ClinicId.Value,
                        QuantityReceived = batch.QuantityReceived,
                        BatchNumber = batch.BatchNumber,
                        BarcodeNumber = batch.BarcodeNumber,
                        ExpiryDate = batch.ExpiryDate,
                        DateOfManufacture = batch.DateOfManufacture,
                        ReceivedDate = receivedDate,
                        ReceivedBy = dto.ReceivedBy,
                        Notes = batch.Notes,
                        UnitCost = item.UnitCost,
                        LotNumber = item.LotNumber,
                        SupplierId = order.SupplierId,
                        QuantityOnHand = batch.QuantityReceived,
                        Barcode = barcode,
                        Shelf = batch.Shelf,
                        Bin = batch.Bin,
                        CreatedAt = DateTimeOffset.UtcNow,
                        UpdatedAt = DateTimeOffset.UtcNow
                    };
                    await _receivingHistoryRepository.AddAsync(receivingHistory);

                    // Update inventory with the received quantity for this specific batch
                    if (order.ClinicId.HasValue && receivedItem.ProductId != Guid.Empty)
                    {
                        // Get inventory for this product and clinic using repository (single record)
                        var inventory = await _inventoryRepository.GetByProductAndBatchAsync(
                            receivedItem.ProductId, order.ClinicId.Value, item.LotNumber, batch.BatchNumber);
                        if (inventory != null)
                        {
                            inventory.QuantityOnHand += batch.QuantityReceived;
                            inventory.UpdatedAt = DateTimeOffset.UtcNow;
                            await _inventoryRepository.UpdateAsync(inventory);
                        }
                        else
                        {
                            // If inventory does not exist, use service to add new inventory
                            await _inventoryService.AddInventoryFromPoReceivingAsync(
                                order.ClinicId.Value,
                                receivedItem.ProductId,
                                item.LotNumber,
                                batch.BatchNumber,
                                batch.ExpiryDate,
                                batch.DateOfManufacture,
                                batch.QuantityReceived,
                                item.UnitCost,
                                "EA",
                                item.UnitsPerPackage,
                                item.Id,
                                order.SupplierId // Pass supplierId from received item
                            );
                        }
                    }
                }
            }

            // Update order status
            var allItems = await _purchaseOrderItemRepository.GetByPurchaseOrderIdAsync(order.Id);
            var allReceived = allItems.All(item => (item.QuantityReceived ?? 0) >= item.QuantityOrdered);
            var partiallyReceived = allItems.Any(item => (item.QuantityReceived ?? 0) > 0);

            if (allReceived)
                order.Status = "received";
            else if (partiallyReceived)
                order.Status = "partial";

            await _purchaseOrderRepository.UpdateAsync(order);

            return await GetByIdAsync(order.Id);
        }

        public async Task<IEnumerable<PurchaseOrderReceivingHistoryDto>> GetReceivingHistoryAsync(string orderNumber)
        {
            var order = await _purchaseOrderRepository.GetByOrderNumberAsync(orderNumber);
            if (order == null)
                throw new InvalidOperationException("Purchase order not found");

            var items = await _purchaseOrderItemRepository.GetByPurchaseOrderIdAsync(order.Id);
            var history = new List<PurchaseOrderReceivingHistoryDto>();

            foreach (var item in items)
            {
                if (item.QuantityReceived > 0)
                {
                    var historyItem = new PurchaseOrderReceivingHistoryDto
                    {
                        PurchaseOrderItemId = item.Id,
                        OrderNumber = order.OrderNumber,
                        ProductName = "", // Would need to join with products table
                        QuantityOrdered = item.QuantityOrdered,
                        QuantityReceived = item.QuantityReceived ?? 0,
                        RemainingQuantity = item.QuantityOrdered - (item.QuantityReceived ?? 0),
                        BatchNumber = item.BatchNumber ?? "",
                        ExpiryDate = item.ExpirationDate ?? DateTime.MinValue,
                        DateOfManufacture = item.DateOfManufacture,
                        ReceivedAt = item.UpdatedAt,
                        ReceivedBy = item.ReceivedBy,
                        Notes = ""
                    };
                    history.Add(historyItem);
                }
            }

            return history;
        }

        public async Task<PurchaseOrderItemResponseDto> UpdateReceivedItemAsync(UpdateReceivedItemRequestDto dto)
        {
            var item = await _purchaseOrderItemRepository.GetByIdAsync(dto.PurchaseOrderItemId);
            if (item == null)
                throw new InvalidOperationException("Purchase order item not found");

            if (item.QuantityReceived <= 0)
                throw new InvalidOperationException("Cannot update details for unreceived item");

            // Update item details
            item.BatchNumber = dto.BatchNumber;
            item.ExpirationDate = dto.ExpiryDate;
            item.DateOfManufacture = dto.DateOfManufacture;
            item.UpdatedAt = DateTimeOffset.UtcNow;

            await _purchaseOrderItemRepository.UpdateAsync(item);

            return _mapper.Map<PurchaseOrderItemResponseDto>(item);
        }

        private void CalculateOrderTotals(PurchaseOrder order, List<CreatePurchaseOrderItemRequestDto> items)
        {
            if (items == null || !items.Any())
            {
                order.ExtendedAmount = 0;
                order.TotalAmount = 0;
                order.DiscountedAmount = 0;
                order.DiscountPercentage = 0;
                return;
            }

            var totalBeforeDiscount = items.Sum(item => (item.UnitCost ?? 0) * item.QuantityOrdered);
            var totalDiscounted = items.Sum(item => item.DiscountedAmount ?? 0);
            var totalDiscountPercentage = items.Average(item => item.DiscountPercentage ?? 0);
            var extendedAmount = items.Sum(item => item.ExtendedAmount ?? 0);
            var totalAmount = items.Sum(item => item.TotalAmount ?? 0);

            order.DiscountedAmount = totalDiscounted;
            order.DiscountPercentage = totalDiscountPercentage;
            order.ExtendedAmount = extendedAmount;
            order.TotalAmount = totalAmount;
        }

        private void CalculateOrderTotals(PurchaseOrder order, List<UpdatePurchaseOrderItemRequestDto> items)
        {
            if (items == null || !items.Any())
            {
                order.ExtendedAmount = 0;
                order.TotalAmount = 0;
                order.DiscountedAmount = 0;
                order.DiscountPercentage = 0;
                return;
            }

            var totalBeforeDiscount = items.Sum(item => (item.UnitCost ?? 0) * item.QuantityOrdered);
            var totalDiscounted = items.Sum(item => item.DiscountedAmount ?? 0);
            var totalDiscountPercentage = items.Average(item => item.DiscountPercentage ?? 0);
            var extendedAmount = items.Sum(item => item.ExtendedAmount ?? 0);
            var totalAmount = items.Sum(item => item.TotalAmount ?? 0);

            order.DiscountedAmount = totalDiscounted;
            order.DiscountPercentage = totalDiscountPercentage;
            order.ExtendedAmount = extendedAmount;
            order.TotalAmount = totalAmount;
        }

        private void CalculateItemTotals(PurchaseOrderItem item)
        {
            var totalBeforeDiscount = (item.UnitCost ?? 0) * item.QuantityOrdered;
            var discountedAmount = totalBeforeDiscount * ((item.DiscountPercentage ?? 0) / 100);
            var extendedAmount = totalBeforeDiscount - discountedAmount;
            var totalAmount = extendedAmount + (item.TaxAmount ?? 0);

            // Calculate total units in EA (Each) for inventory tracking
            try
            {
                item.TotalUnits = UomHelper.ConvertToEa(item.QuantityOrdered, "EA", item.UnitsPerPackage);
            }
            catch (ArgumentException ex)
            {
                throw new InvalidOperationException($"Invalid UOM configuration: {ex.Message}");
            }

            item.DiscountedAmount = discountedAmount;
            item.ExtendedAmount = extendedAmount;
            item.TotalAmount = totalAmount;
        }

        // New methods for receiving history
        public async Task<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>> GetReceivingHistoryByProductAsync(Guid productId)
        {
            var history = await _receivingHistoryRepository.GetByProductIdAsync(productId);
            var response = _mapper.Map<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>>(history);
            
            // Populate additional details
            foreach (var item in response)
            {
                if (item.ProductId != Guid.Empty)
                {
                    var product = await _productService.GetByIdAsync(item.ProductId);
                    if (product != null)
                    {
                        item.ProductName = product.Name;
                    }
                }
                
                if (item.SupplierId.HasValue)
                {
                    var supplier = await _supplierRepository.GetByIdAsync(item.SupplierId.Value);
                    if (supplier != null)
                    {
                        item.SupplierName = supplier.Name;
                    }
                }
                
                if (item.ClinicId != Guid.Empty)
                {
                    var clinic = await _clinicRepository.GetByIdAsync(item.ClinicId);
                    if (clinic != null)
                    {
                        item.ClinicName = clinic.Name;
                    }
                }
                
                if (item.ReceivedBy.HasValue)
                {
                    var user = await _userRepository.GetByIdAsync(item.ReceivedBy.Value);
                    if (user != null)
                    {
                        item.ReceivedByName = $"{user.FirstName} {user.LastName}".Trim();
                    }
                }
                
                if (item.PurchaseOrderId != Guid.Empty)
                {
                    var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(item.PurchaseOrderId);
                    if (purchaseOrder != null)
                    {
                        item.OrderNumber = purchaseOrder.OrderNumber;
                    }
                }

                // Get current quantity in hand for this product and clinic
                if (item.ProductId != Guid.Empty && item.ClinicId != Guid.Empty)
                {
                    try
                    {
                        // First try to get from purchase order receiving history table directly
                        var historyRecord = await _receivingHistoryRepository.GetByIdAsync(item.Id);
                        if (historyRecord != null && historyRecord.QuantityOnHand.HasValue)
                        {
                            item.QuantityInHand = historyRecord.QuantityOnHand.Value;
                        }

                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get quantity in hand for product {ProductId}, clinic {ClinicId}",
                            item.ProductId, item.ClinicId);
                        item.QuantityInHand = 0;
                    }
                }

            }
            
            return response;
        }

        public async Task<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>> GetReceivingHistoryByClinicAsync(Guid clinicId, string? productName = null, Guid? companyId = null)
        {
            var history = await _receivingHistoryRepository.GetByClinicIdAsync(clinicId, productName, companyId);
            var response = _mapper.Map<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>>(history);
            
            // Populate additional details
            foreach (var item in response)
            {
                if (item.ProductId != Guid.Empty)
                {
                    var product = await _productService.GetByIdAsync(item.ProductId);
                    if (product != null)
                    {
                        item.ProductName = product.Name;
                        item.ProductDetails = _mapper.Map<ProductDto>(product);
                    }
                }

                if (item.SupplierId.HasValue)
                {
                    var supplier = await _supplierRepository.GetByIdAsync(item.SupplierId.Value);
                    if (supplier != null)
                    {
                        item.SupplierName = supplier.Name;
                        item.SupplierDetails = _mapper.Map<SupplierDto>(supplier);
                    }
                }
                
                if (item.ClinicId != Guid.Empty)
                {
                    var clinic = await _clinicRepository.GetByIdAsync(item.ClinicId);
                    if (clinic != null)
                    {
                        item.ClinicName = clinic.Name;
                    }
                }
                
                if (item.ReceivedBy.HasValue)
                {
                    var user = await _userRepository.GetByIdAsync(item.ReceivedBy.Value);
                    if (user != null)
                    {
                        item.ReceivedByName = $"{user.FirstName} {user.LastName}".Trim();
                    }
                }
                
                if (item.PurchaseOrderId != Guid.Empty)
                {
                    var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(item.PurchaseOrderId);
                    if (purchaseOrder != null)
                    {
                        item.OrderNumber = purchaseOrder.OrderNumber;
                    }
                }

                // Get current quantity in hand for this product and clinic
                if (item.ProductId != Guid.Empty && item.ClinicId != Guid.Empty)
                {
                    try
                    {
                        // First try to get from purchase order receiving history table directly
                        var historyRecord = await _receivingHistoryRepository.GetByIdAsync(item.Id);
                        if (historyRecord != null && historyRecord.QuantityOnHand.HasValue)
                        {
                            item.QuantityInHand = historyRecord.QuantityOnHand.Value;
                        }
                        
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get quantity in hand for product {ProductId}, clinic {ClinicId}",
                            item.ProductId, item.ClinicId);
                        item.QuantityInHand = 0;
                    }
                }
            }
            
            // Ensure the response is ordered by expiry date (nearest expiry first), then by received date desc
            return response.OrderBy(x => x.ExpiryDate ?? DateTime.MaxValue)
                          .ThenByDescending(x => x.ReceivedDate)
                          .ThenByDescending(x => x.CreatedAt);
        }

        public async Task<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>> GetReceivingHistoryByProductAndClinicAsync(Guid productId, Guid clinicId)
        {
            _logger.LogInformation("Retrieving receiving history from repository for product {ProductId} and clinic {ClinicId}", productId, clinicId);
            var history = await _receivingHistoryRepository.GetByProductAndClinicAsync(productId, clinicId);
            _logger.LogInformation("Repository returned {Count} records for product {ProductId} and clinic {ClinicId}",
                history?.Count() ?? 0, productId, clinicId);

            var response = _mapper.Map<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>>(history);
            
            // Populate additional details
            foreach (var item in response)
            {
                if (item.ProductId != Guid.Empty)
                {
                    var product = await _productService.GetByIdAsync(item.ProductId);
                    if (product != null)
                    {
                        item.ProductName = product.Name;
                    }
                }
                
                if (item.SupplierId.HasValue)
                {
                    var supplier = await _supplierRepository.GetByIdAsync(item.SupplierId.Value);
                    if (supplier != null)
                    {
                        item.SupplierName = supplier.Name;
                    }
                }
                
                if (item.ClinicId != Guid.Empty)
                {
                    var clinic = await _clinicRepository.GetByIdAsync(item.ClinicId);
                    if (clinic != null)
                    {
                        item.ClinicName = clinic.Name;
                    }
                }
                
                if (item.ReceivedBy.HasValue)
                {
                    var user = await _userRepository.GetByIdAsync(item.ReceivedBy.Value);
                    if (user != null)
                    {
                        item.ReceivedByName = $"{user.FirstName} {user.LastName}".Trim();
                    }
                }
                
                if (item.PurchaseOrderId != Guid.Empty)
                {
                    var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(item.PurchaseOrderId);
                    if (purchaseOrder != null)
                    {
                        item.OrderNumber = purchaseOrder.OrderNumber;
                    }
                }

                // Get current quantity in hand for this product and clinic
                if (item.ProductId != Guid.Empty && item.ClinicId != Guid.Empty)
                {
                    try
                    {
                        // First try to get from purchase order receiving history table directly
                        var historyRecord = await _receivingHistoryRepository.GetByIdAsync(item.Id);
                        if (historyRecord != null && historyRecord.QuantityOnHand.HasValue)
                        {
                            item.QuantityInHand = historyRecord.QuantityOnHand.Value;
                        }

                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get quantity in hand for product {ProductId}, clinic {ClinicId}",
                            item.ProductId, item.ClinicId);
                        item.QuantityInHand = 0;
                    }
                }
            }
            
            // Ensure the response is ordered by expiry date (nearest expiry first), then by received date desc
            return response.OrderBy(x => x.ExpiryDate ?? DateTime.MaxValue)
                          .ThenByDescending(x => x.ReceivedDate)
                          .ThenByDescending(x => x.CreatedAt);
        }

        public async Task<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>> GetAllReceivingHistoryAsync()
        {
            var history = await _receivingHistoryRepository.GetAllAsync();
            var response = _mapper.Map<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>>(history);
            
            // Populate additional details
            foreach (var item in response)
            {
                if (item.ProductId != Guid.Empty)
                {
                    var product = await _productService.GetByIdAsync(item.ProductId);
                    if (product != null)
                    {
                        item.ProductName = product.Name;
                    }
                }
                
                if (item.SupplierId.HasValue)
                {
                    var supplier = await _supplierRepository.GetByIdAsync(item.SupplierId.Value);
                    if (supplier != null)
                    {
                        item.SupplierName = supplier.Name;
                    }
                }
                
                if (item.ClinicId != Guid.Empty)
                {
                    var clinic = await _clinicRepository.GetByIdAsync(item.ClinicId);
                    if (clinic != null)
                    {
                        item.ClinicName = clinic.Name;
                    }
                }
                
                if (item.ReceivedBy.HasValue)
                {
                    var user = await _userRepository.GetByIdAsync(item.ReceivedBy.Value);
                    if (user != null)
                    {
                        item.ReceivedByName = $"{user.FirstName} {user.LastName}".Trim();
                    }
                }
                
                if (item.PurchaseOrderId != Guid.Empty)
                {
                    var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(item.PurchaseOrderId);
                    if (purchaseOrder != null)
                    {
                        item.OrderNumber = purchaseOrder.OrderNumber;
                    }
                }
                
                // Get current quantity in hand for this product and clinic
                if (item.ProductId != Guid.Empty && item.ClinicId != Guid.Empty)
                {
                    var inventory = await _inventoryRepository.GetByProductAndBatchRangeAsync(
                        item.ProductId, item.ClinicId, item.LotNumber, item.BatchNumber);
                    if (inventory != null && inventory.Any())
                    {
                        item.QuantityInHand = inventory.Sum(i => i.QuantityOnHand);
                    }
                }
            }
            
            // Ensure the response is ordered by expiry date (nearest expiry first), then by received date desc
            return response.OrderBy(x => x.ExpiryDate ?? DateTime.MaxValue)
                          .ThenByDescending(x => x.ReceivedDate)
                          .ThenByDescending(x => x.CreatedAt);
        }

        public async Task<BarcodeScanResponseDto?> GetByBarcodeAsync(string barcode)
        {
            var receivingHistory = await _receivingHistoryRepository.GetByBarcodeAsync(barcode);
            if (receivingHistory == null) return null;

            var response = _mapper.Map<BarcodeScanResponseDto>(receivingHistory);

            // Get product details
            if (receivingHistory.ProductId != Guid.Empty)
            {
                var product = await _productService.GetByIdAsync(receivingHistory.ProductId);
                if (product != null)
                {
                    response.ProductName = product.Name;
                    response.ProductNumber = product.ProductNumber;
                    response.GenericName = product.GenericName;
                    response.Category = product.Category;
                    // ProductType removed
                }
            }

            // Get clinic details
            if (receivingHistory.ClinicId != Guid.Empty)
            {
                var clinic = await _clinicRepository.GetByIdAsync(receivingHistory.ClinicId);
                response.ClinicName = clinic?.Name;
            }

            // Get supplier details
            if (receivingHistory.SupplierId.HasValue)
            {
                var supplier = await _supplierRepository.GetByIdAsync(receivingHistory.SupplierId.Value);
                response.SupplierName = supplier?.Name;
            }

            // Get received by user details
            if (receivingHistory.ReceivedBy.HasValue)
            {
                var user = await _userRepository.GetByIdAsync(receivingHistory.ReceivedBy.Value);
                response.ReceivedByName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : null;
            }

            // Get purchase order details
            if (receivingHistory.PurchaseOrderId != Guid.Empty)
            {
                var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(receivingHistory.PurchaseOrderId);
                if (purchaseOrder != null)
                {
                    response.OrderNumber = purchaseOrder.OrderNumber;
                    response.OrderDate = purchaseOrder.OrderDate;
                    response.OrderStatus = purchaseOrder.Status;
                    response.OrderTotalAmount = purchaseOrder.TotalAmount;
                }
            }

            // Get purchase order item details
            if (receivingHistory.PurchaseOrderItemId != Guid.Empty)
            {
                var purchaseOrderItem = await _purchaseOrderItemRepository.GetByIdAsync(receivingHistory.PurchaseOrderItemId);
                if (purchaseOrderItem != null)
                {
                    response.QuantityOrdered = purchaseOrderItem.QuantityOrdered;
                    response.RemainingQuantity = purchaseOrderItem.QuantityOrdered - (purchaseOrderItem.QuantityReceived ?? 0);
                }
            }

            // Get current quantity in hand for this product and clinic
            if (receivingHistory.ProductId != Guid.Empty && receivingHistory.ClinicId != Guid.Empty)
            {
                var inventory = await _inventoryRepository.GetByProductAndBatchRangeAsync(
                    receivingHistory.ProductId, receivingHistory.ClinicId, receivingHistory.LotNumber, receivingHistory.BatchNumber);
                if (inventory != null && inventory.Any())
                {
                    response.QuantityOnHand = inventory.Sum(i => i.QuantityOnHand);
                }
            }

            return response;
        }

        public async Task<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>> GetReceivingHistoryFilteredAsync(PurchaseOrderReceivingHistoryFilterDto filter)
        {
            // For now, implement basic filtering using existing repository methods
            // This can be enhanced later with a proper filtered repository method
            var allHistory = await _receivingHistoryRepository.GetAllAsync();
            var filteredHistory = allHistory.AsEnumerable();

            // Apply filters
            if (filter.Id.HasValue)
                filteredHistory = filteredHistory.Where(h => h.Id == filter.Id.Value);

            if (filter.PurchaseOrderId.HasValue)
                filteredHistory = filteredHistory.Where(h => h.PurchaseOrderId == filter.PurchaseOrderId.Value);

            if (filter.PurchaseOrderItemId.HasValue)
                filteredHistory = filteredHistory.Where(h => h.PurchaseOrderItemId == filter.PurchaseOrderItemId.Value);

            if (filter.ProductId.HasValue)
                filteredHistory = filteredHistory.Where(h => h.ProductId == filter.ProductId.Value);

            if (filter.ClinicId.HasValue)
                filteredHistory = filteredHistory.Where(h => h.ClinicId == filter.ClinicId.Value);

            if (filter.SupplierId.HasValue)
                filteredHistory = filteredHistory.Where(h => h.SupplierId == filter.SupplierId.Value);

            if (filter.ReceivedBy.HasValue)
                filteredHistory = filteredHistory.Where(h => h.ReceivedBy == filter.ReceivedBy.Value);

            if (filter.QuantityReceived.HasValue)
                filteredHistory = filteredHistory.Where(h => h.QuantityReceived == filter.QuantityReceived.Value);

            if (filter.QuantityOnHand.HasValue)
                filteredHistory = filteredHistory.Where(h => h.QuantityOnHand == filter.QuantityOnHand.Value);

            if (!string.IsNullOrEmpty(filter.BatchNumber))
                filteredHistory = filteredHistory.Where(h => h.BatchNumber != null && h.BatchNumber.Contains(filter.BatchNumber, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrEmpty(filter.LotNumber))
                filteredHistory = filteredHistory.Where(h => h.LotNumber != null && h.LotNumber.Contains(filter.LotNumber, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrEmpty(filter.Barcode))
                filteredHistory = filteredHistory.Where(h => h.Barcode != null && h.Barcode.Contains(filter.Barcode, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrEmpty(filter.Shelf))
                filteredHistory = filteredHistory.Where(h => h.Shelf != null && h.Shelf.Contains(filter.Shelf, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrEmpty(filter.Bin))
                filteredHistory = filteredHistory.Where(h => h.Bin != null && h.Bin.Contains(filter.Bin, StringComparison.OrdinalIgnoreCase));

            if (filter.ExpiryDateFrom.HasValue)
                filteredHistory = filteredHistory.Where(h => h.ExpiryDate >= filter.ExpiryDateFrom.Value);

            if (filter.ExpiryDateTo.HasValue)
                filteredHistory = filteredHistory.Where(h => h.ExpiryDate <= filter.ExpiryDateTo.Value);

            if (filter.DateOfManufactureFrom.HasValue)
                filteredHistory = filteredHistory.Where(h => h.DateOfManufacture >= filter.DateOfManufactureFrom.Value);

            if (filter.DateOfManufactureTo.HasValue)
                filteredHistory = filteredHistory.Where(h => h.DateOfManufacture <= filter.DateOfManufactureTo.Value);

            if (filter.ReceivedDateFrom.HasValue)
                filteredHistory = filteredHistory.Where(h => h.ReceivedDate >= filter.ReceivedDateFrom.Value);

            if (filter.ReceivedDateTo.HasValue)
                filteredHistory = filteredHistory.Where(h => h.ReceivedDate <= filter.ReceivedDateTo.Value);

            if (filter.UnitCostFrom.HasValue)
                filteredHistory = filteredHistory.Where(h => h.UnitCost >= filter.UnitCostFrom.Value);

            if (filter.UnitCostTo.HasValue)
                filteredHistory = filteredHistory.Where(h => h.UnitCost <= filter.UnitCostTo.Value);

            if (filter.CreatedFrom.HasValue)
                filteredHistory = filteredHistory.Where(h => h.CreatedAt >= filter.CreatedFrom.Value);

            if (filter.CreatedTo.HasValue)
                filteredHistory = filteredHistory.Where(h => h.CreatedAt <= filter.CreatedTo.Value);

            if (filter.UpdatedFrom.HasValue)
                filteredHistory = filteredHistory.Where(h => h.UpdatedAt >= filter.UpdatedFrom.Value);

            if (filter.UpdatedTo.HasValue)
                filteredHistory = filteredHistory.Where(h => h.UpdatedAt <= filter.UpdatedTo.Value);

            if (!string.IsNullOrEmpty(filter.Notes))
                filteredHistory = filteredHistory.Where(h => h.Notes != null && h.Notes.Contains(filter.Notes, StringComparison.OrdinalIgnoreCase));

            // Apply sorting
            if (!string.IsNullOrEmpty(filter.SortBy))
            {
                var isDescending = filter.SortOrder?.ToLower() == "desc";

                filteredHistory = filter.SortBy.ToLower() switch
                {
                    "id" => isDescending ? filteredHistory.OrderByDescending(h => h.Id) : filteredHistory.OrderBy(h => h.Id),
                    "received_date" => isDescending ? filteredHistory.OrderByDescending(h => h.ReceivedDate) : filteredHistory.OrderBy(h => h.ReceivedDate),
                    "created_at" => isDescending ? filteredHistory.OrderByDescending(h => h.CreatedAt) : filteredHistory.OrderBy(h => h.CreatedAt),
                    "updated_at" => isDescending ? filteredHistory.OrderByDescending(h => h.UpdatedAt) : filteredHistory.OrderBy(h => h.UpdatedAt),
                    "quantity_received" => isDescending ? filteredHistory.OrderByDescending(h => h.QuantityReceived) : filteredHistory.OrderBy(h => h.QuantityReceived),
                    "unit_cost" => isDescending ? filteredHistory.OrderByDescending(h => h.UnitCost) : filteredHistory.OrderBy(h => h.UnitCost),
                    _ => filteredHistory.OrderByDescending(h => h.ReceivedDate)
                };
            }
            else
            {
                filteredHistory = filteredHistory.OrderByDescending(h => h.ReceivedDate);
            }

            // Apply pagination
            if (filter.PageNumber.HasValue && filter.PageSize.HasValue)
            {
                var skip = (filter.PageNumber.Value - 1) * filter.PageSize.Value;
                filteredHistory = filteredHistory.Skip(skip).Take(filter.PageSize.Value);
            }

            var response = _mapper.Map<IEnumerable<PurchaseOrderReceivingHistoryResponseDto>>(filteredHistory);

            // Populate additional details (same as GetAllReceivingHistoryAsync)
            foreach (var item in response)
            {
                if (item.ProductId != Guid.Empty)
                {
                    var product = await _productService.GetByIdAsync(item.ProductId);
                    if (product != null)
                    {
                        item.ProductName = product.Name;
                    }
                }

                if (item.SupplierId.HasValue)
                {
                    var supplier = await _supplierRepository.GetByIdAsync(item.SupplierId.Value);
                    if (supplier != null)
                    {
                        item.SupplierName = supplier.Name;
                    }
                }

                if (item.ClinicId != Guid.Empty)
                {
                    var clinic = await _clinicRepository.GetByIdAsync(item.ClinicId);
                    if (clinic != null)
                    {
                        item.ClinicName = clinic.Name;
                    }
                }

                if (item.ReceivedBy.HasValue)
                {
                    var user = await _userRepository.GetByIdAsync(item.ReceivedBy.Value);
                    if (user != null)
                    {
                        item.ReceivedByName = $"{user.FirstName} {user.LastName}".Trim();
                    }
                }

                if (item.PurchaseOrderId != Guid.Empty)
                {
                    var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(item.PurchaseOrderId);
                    if (purchaseOrder != null)
                    {
                        item.OrderNumber = purchaseOrder.OrderNumber;
                    }
                }

                // Get current quantity in hand for this product and clinic
                if (item.ProductId != Guid.Empty && item.ClinicId != Guid.Empty)
                {
                    var inventory = await _inventoryRepository.GetByProductAndBatchRangeAsync(
                        item.ProductId, item.ClinicId, item.LotNumber, item.BatchNumber);
                    if (inventory != null && inventory.Any())
                    {
                        item.QuantityInHand = inventory.Sum(i => i.QuantityOnHand);
                    }
                }
            }

            return response;
        }

        public async Task<PurchaseOrderReceivingHistoryResponseDto> GetReceivingHistoryByIdAsync(Guid id)
        {
            var history = await _receivingHistoryRepository.GetByIdAsync(id);
            if (history == null)
                throw new KeyNotFoundException($"Receiving history with ID {id} not found");

            var response = _mapper.Map<PurchaseOrderReceivingHistoryResponseDto>(history);

            // Populate additional details
            if (history.ProductId != Guid.Empty)
            {
                var product = await _productService.GetByIdAsync(history.ProductId);
                if (product != null)
                {
                    response.ProductName = product.Name;
                }
            }

            if (history.SupplierId.HasValue)
            {
                var supplier = await _supplierRepository.GetByIdAsync(history.SupplierId.Value);
                if (supplier != null)
                {
                    response.SupplierName = supplier.Name;
                }
            }

            if (history.ClinicId != Guid.Empty)
            {
                var clinic = await _clinicRepository.GetByIdAsync(history.ClinicId);
                if (clinic != null)
                {
                    response.ClinicName = clinic.Name;
                }
            }

            if (history.ReceivedBy.HasValue)
            {
                var user = await _userRepository.GetByIdAsync(history.ReceivedBy.Value);
                if (user != null)
                {
                    response.ReceivedByName = $"{user.FirstName} {user.LastName}".Trim();
                }
            }

            if (history.PurchaseOrderId != Guid.Empty)
            {
                var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(history.PurchaseOrderId);
                if (purchaseOrder != null)
                {
                    response.OrderNumber = purchaseOrder.OrderNumber;
                }
            }

            // Get current quantity in hand for this product and clinic
            if (history.ProductId != Guid.Empty && history.ClinicId != Guid.Empty)
            {
                try
                {
                    // Use the quantity from the history record directly since it's already available
                    if (history.QuantityOnHand.HasValue)
                    {
                        response.QuantityInHand = history.QuantityOnHand.Value;
                    }
                    else
                    {
                        // Fallback to inventory table if needed
                        var inventory = await _inventoryRepository.GetByProductAndBatchRangeAsync(
                            history.ProductId, history.ClinicId, history.LotNumber, history.BatchNumber);
                        if (inventory != null && inventory.Any())
                        {
                            response.QuantityInHand = inventory.Sum(i => i.QuantityOnHand);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get quantity in hand for product {ProductId}, clinic {ClinicId}",
                        history.ProductId, history.ClinicId);
                    response.QuantityInHand = 0;
                }
            }

            return response;
        }

        public async Task<PurchaseOrderReceivingHistoryResponseDto> UpdateReceivingHistoryAsync(Guid id, UpdatePurchaseOrderReceivingHistoryDto dto)
        {
            var existingHistory = await _receivingHistoryRepository.GetByIdAsync(id);
            if (existingHistory == null)
                throw new KeyNotFoundException($"Receiving history with ID {id} not found");

            // Map the DTO to the existing entity
            existingHistory.PurchaseOrderId = dto.PurchaseOrderId;
            existingHistory.PurchaseOrderItemId = dto.PurchaseOrderItemId;
            existingHistory.ProductId = dto.ProductId;
            existingHistory.ClinicId = dto.ClinicId;
            existingHistory.QuantityReceived = dto.QuantityReceived;
            existingHistory.BatchNumber = dto.BatchNumber;
            existingHistory.ExpiryDate = dto.ExpiryDate;
            existingHistory.DateOfManufacture = dto.DateOfManufacture;
            existingHistory.ReceivedDate = dto.ReceivedDate;
            existingHistory.ReceivedBy = dto.ReceivedBy;
            existingHistory.Notes = dto.Notes;
            existingHistory.UnitCost = dto.UnitCost;
            existingHistory.LotNumber = dto.LotNumber;
            existingHistory.SupplierId = dto.SupplierId;
            existingHistory.QuantityOnHand = dto.QuantityOnHand;
            existingHistory.Barcode = dto.Barcode;
            existingHistory.Shelf = dto.Shelf;
            existingHistory.Bin = dto.Bin;
            existingHistory.UpdatedAt = DateTimeOffset.UtcNow;

            var updatedHistory = await _receivingHistoryRepository.UpdateAsync(existingHistory);
            return await GetReceivingHistoryByIdAsync(updatedHistory.Id);
        }

        public async Task<PurchaseOrderReceivingHistoryResponseDto> PatchReceivingHistoryAsync(Guid id, PatchPurchaseOrderReceivingHistoryDto dto)
        {
            var existingHistory = await _receivingHistoryRepository.GetByIdAsync(id);
            if (existingHistory == null)
                throw new KeyNotFoundException($"Receiving history with ID {id} not found");

            // Only update fields that are provided (not null)
            if (dto.PurchaseOrderId.HasValue)
                existingHistory.PurchaseOrderId = dto.PurchaseOrderId.Value;

            if (dto.PurchaseOrderItemId.HasValue)
                existingHistory.PurchaseOrderItemId = dto.PurchaseOrderItemId.Value;

            if (dto.ProductId.HasValue)
                existingHistory.ProductId = dto.ProductId.Value;

            if (dto.ClinicId.HasValue)
                existingHistory.ClinicId = dto.ClinicId.Value;

            if (dto.QuantityReceived.HasValue)
                existingHistory.QuantityReceived = dto.QuantityReceived.Value;

            if (dto.BatchNumber != null)
                existingHistory.BatchNumber = dto.BatchNumber;

            if (dto.ExpiryDate.HasValue)
                existingHistory.ExpiryDate = dto.ExpiryDate;

            if (dto.DateOfManufacture.HasValue)
                existingHistory.DateOfManufacture = dto.DateOfManufacture;

            if (dto.ReceivedDate.HasValue)
                existingHistory.ReceivedDate = dto.ReceivedDate.Value;

            if (dto.ReceivedBy.HasValue)
                existingHistory.ReceivedBy = dto.ReceivedBy;

            if (dto.Notes != null)
                existingHistory.Notes = dto.Notes;

            if (dto.UnitCost.HasValue)
                existingHistory.UnitCost = dto.UnitCost;

            if (dto.LotNumber != null)
                existingHistory.LotNumber = dto.LotNumber;

            if (dto.SupplierId.HasValue)
                existingHistory.SupplierId = dto.SupplierId;

            if (dto.QuantityOnHand.HasValue)
                existingHistory.QuantityOnHand = dto.QuantityOnHand;

            if (dto.Barcode != null)
                existingHistory.Barcode = dto.Barcode;

            if (dto.Shelf != null)
                existingHistory.Shelf = dto.Shelf;

            if (dto.Bin != null)
                existingHistory.Bin = dto.Bin;

            existingHistory.UpdatedAt = DateTimeOffset.UtcNow;

            var updatedHistory = await _receivingHistoryRepository.UpdateAsync(existingHistory);
            return await GetReceivingHistoryByIdAsync(updatedHistory.Id);
        }
    }
}
