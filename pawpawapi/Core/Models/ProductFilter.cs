using System;

namespace Core.Models
{
    public class ProductFilter
    {
        public Guid? CompanyId { get; set; }
        public string? Search { get; set; }
        public string? Category { get; set; }
        public string? DosageForm { get; set; }
        public string? UnitOfMeasure { get; set; }
        public bool? RequiresPrescription { get; set; }
        public string? ControlledSubstanceSchedule { get; set; }
        public bool? IsActive { get; set; }
        public decimal? MinPrice { get; set; } // Cost price range
        public decimal? MaxPrice { get; set; } // Cost price range
        public decimal? MinSellingPrice { get; set; } // Selling price range
        public decimal? MaxSellingPrice { get; set; } // Selling price range
        public bool? LowStock { get; set; }
        public DateTimeOffset? CreatedFrom { get; set; }
        public DateTimeOffset? CreatedTo { get; set; }
        public string? SortBy { get; set; }
        public string? SortOrder { get; set; }
    }
} 