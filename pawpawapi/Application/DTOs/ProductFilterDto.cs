using System;

namespace Application.DTOs
{
    public class ProductFilterDto
    {
        public Guid? CompanyId { get; set; }
        public string? Search { get; set; }
        public string? Category { get; set; }
        // ProductType removed
        public string? DosageForm { get; set; }
        public string? UnitOfMeasure { get; set; }
        public bool? RequiresPrescription { get; set; }
        public string? ControlledSubstanceSchedule { get; set; }
        public bool? IsActive { get; set; }
        public decimal? MinPrice { get; set; } // Cost price range
        public decimal? MaxPrice { get; set; } // Cost price range
        public decimal? MinSellingPrice { get; set; } // Selling price range
        public decimal? MaxSellingPrice { get; set; } // Selling price range
        public bool? LowStock { get; set; } // Filter products below reorder threshold
        public DateTimeOffset? CreatedFrom { get; set; }
        public DateTimeOffset? CreatedTo { get; set; }
        public string? SortBy { get; set; } // name, price, created_at, etc.
        public string? SortOrder { get; set; } // asc, desc
    }
} 