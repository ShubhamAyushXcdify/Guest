using System;

namespace Application.DTOs
{
    public class CreatePurchaseOrderItemRequestDto
    {
        public Guid? PurchaseOrderId { get; set; }
        public Guid ProductId { get; set; }
        public int QuantityOrdered { get; set; }
        public decimal? UnitCost { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? DiscountedAmount { get; set; }
        public decimal? ExtendedAmount { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public int? UnitsPerPackage { get; set; } // Number of tablets per strip, ml per bottle, etc.
        public decimal? TotalUnits { get; set; } // Total units in EA (QuantityOrdered * UnitsPerPackage)
    }
} 