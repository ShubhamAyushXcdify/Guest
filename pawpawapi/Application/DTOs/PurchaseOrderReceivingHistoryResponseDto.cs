using System;

namespace Application.DTOs
{
    public class PurchaseOrderReceivingHistoryResponseDto
    {
        public Guid Id { get; set; }
        public Guid PurchaseOrderId { get; set; }
        public Guid PurchaseOrderItemId { get; set; }
        public Guid ProductId { get; set; }
        public Guid ClinicId { get; set; }
        public int QuantityReceived { get; set; }
        public string BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public DateTime? DateOfManufacture { get; set; }
        public DateTime ReceivedDate { get; set; }
        public Guid? ReceivedBy { get; set; }
        public string? Notes { get; set; }
        public decimal? UnitCost { get; set; }
        public string? LotNumber { get; set; }
        public Guid? SupplierId { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        
        // Additional properties for display
        public string? ProductName { get; set; }
        public string? ClinicName { get; set; }
        public string? SupplierName { get; set; }
        public string? ReceivedByName { get; set; }
        public string? OrderNumber { get; set; }
        public int? QuantityInHand { get; set; }
        public string? Barcode { get; set; }
        public string? Shelf { get; set; }
        public string? Bin { get; set; }
        public string? BarcodeNumber { get; set; }

        // Nested objects
        public ProductDto? ProductDetails { get; set; }
        public SupplierDto? SupplierDetails { get; set; }
    }
} 