using System;

namespace Core.Models
{
    public class Inventory
    {
        public Guid Id { get; set; }
        public Guid? ClinicId { get; set; }
        public Guid? ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? LotNumber { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public DateTime? DateOfManufacture { get; set; }
        public int QuantityOnHand { get; set; } // Always in EA (Each) units
        public int? QuantityReserved { get; set; }
        public int? ReorderLevel { get; set; }
        public int? ReorderQuantity { get; set; }
        public decimal? UnitCost { get; set; } // Cost per EA unit
        public decimal? WholesaleCost { get; set; }
        public decimal? RetailPrice { get; set; }
        public string? UnitOfMeasure { get; set; } // EA, Strip, Bottle, etc.
        public int? UnitsPerPackage { get; set; } // Number of tablets per strip, ml per bottle, etc.
        public string? Location { get; set; }
        public bool? ReceivedFromPo { get; set; }
        public Guid? PoItemId { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public Guid? SupplierId { get; set; } // Added for supplier tracking
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public string Status { get; set; }
    }
} 