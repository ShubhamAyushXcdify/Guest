using System;

namespace Application.DTOs
{
    public class ProductDto
    {
        public Guid? Id { get; set; }
        public string? ProductNumber { get; set; }
        public string? Name { get; set; }
        public string? GenericName { get; set; }
        public string? Category { get; set; }
        public string? Manufacturer { get; set; }
        public string? NdcNumber { get; set; }
        public string? Strength { get; set; }
        public string? DosageForm { get; set; }
        public string? UnitOfMeasure { get; set; }
        public bool? RequiresPrescription { get; set; }
        public string? ControlledSubstanceSchedule { get; set; }
        public string? BrandName { get; set; }
        public string? StorageRequirements { get; set; }
        public bool? IsActive { get; set; }
        public decimal? Price { get; set; } // Cost price (purchase price)
        public decimal? SellingPrice { get; set; } // Selling price to customers
    }
} 