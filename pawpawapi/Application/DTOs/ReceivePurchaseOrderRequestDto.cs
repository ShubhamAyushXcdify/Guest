using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class ReceivePurchaseOrderRequestDto
    {
        public Guid PurchaseOrderId { get; set; }
        public string? Notes { get; set; }
        public Guid? ReceivedBy { get; set; }
        public List<ReceivedItemDto> ReceivedItems { get; set; } = new List<ReceivedItemDto>();
    }

    public class ReceivedItemDto
    {
        public Guid PurchaseOrderItemId { get; set; }
        public Guid ProductId { get; set; }
        public List<BatchDto> Batches { get; set; } = new List<BatchDto>();
    }

    public class BatchDto
    {
        public int QuantityReceived { get; set; }
        public string? BatchNumber { get; set; }
        public string? BarcodeNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public DateTime? DateOfManufacture { get; set; }
        public string? Notes { get; set; }
        public string? Shelf { get; set; }
        public string? Bin { get; set; }
    }

    // Keep the old structure for backward compatibility if needed
    [Obsolete("Use the new batch-based structure with ReceivedItemDto.Batches")]
    public class LegacyReceivedItemDto
    {
        public Guid PurchaseOrderItemId { get; set; }
        public Guid ProductId { get; set; }
        public int QuantityReceived { get; set; }
        public string BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public DateTime? DateOfManufacture { get; set; }
        public string? Notes { get; set; }
        public string? Shelf { get; set; }
        public string? Bin { get; set; }
    }
}