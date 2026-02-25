using System;

namespace Core.Models
{
    public class PurchaseOrderItem
    {
        public Guid Id { get; set; }
        public Guid? PurchaseOrderId { get; set; }
        public Guid? ProductId { get; set; }
        public int QuantityOrdered { get; set; }
        public int? QuantityReceived { get; set; }
        public decimal? UnitCost { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? DiscountedAmount { get; set; }
        public decimal? ExtendedAmount { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public int? UnitsPerPackage { get; set; } // Number of tablets per strip, ml per bottle, etc.
        public decimal? TotalUnits { get; set; } // Total units in EA (QuantityOrdered * UnitsPerPackage)
        public string? LotNumber { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public DateTime? DateOfManufacture { get; set; }
        public DateTime? ActualDeliveryDate { get; set; }
        public Guid? ReceivedBy { get; set; }
        public Guid? SupplierId { get; set; } // Added for supplier tracking
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public string? BarcodeNumber { get; set; }
    }
} 