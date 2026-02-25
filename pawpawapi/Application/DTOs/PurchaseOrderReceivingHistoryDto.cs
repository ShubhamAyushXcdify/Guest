using System;

namespace Application.DTOs
{
    public class PurchaseOrderReceivingHistoryDto
    {
        public Guid PurchaseOrderItemId { get; set; }
        public string OrderNumber { get; set; }
        public string ProductName { get; set; }
        public int QuantityOrdered { get; set; }
        public int QuantityReceived { get; set; }
        public int RemainingQuantity { get; set; }
        public string BatchNumber { get; set; }
        public DateTime ExpiryDate { get; set; }
        public DateTime? DateOfManufacture { get; set; }
        public DateTimeOffset? ReceivedAt { get; set; }
        public Guid? ReceivedBy { get; set; }
        public string? Notes { get; set; }
        public string? Shelf { get; set; }
        public string? Bin { get; set; }
    }
} 