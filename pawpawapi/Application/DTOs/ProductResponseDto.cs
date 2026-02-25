using System;

namespace Application.DTOs
{
    public class ProductResponseDto
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public string ProductNumber { get; set; }
        public string Name { get; set; }
        public string? GenericName { get; set; }
        public string? Category { get; set; }
        public string? NdcNumber { get; set; }
        public string? DosageForm { get; set; }
        public string? UnitOfMeasure { get; set; }
        public bool? RequiresPrescription { get; set; }
        public string? ControlledSubstanceSchedule { get; set; }
        public string? BrandName { get; set; }
        public string? StorageRequirements { get; set; }
        public bool? IsActive { get; set; }
        public decimal? Price { get; set; } // Cost price (purchase price)
        public decimal? SellingPrice { get; set; } // Selling price to customers
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public int? ReorderThreshold { get; set; }
    }
} 