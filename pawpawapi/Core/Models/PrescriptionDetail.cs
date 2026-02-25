using System;
using System.Collections.Generic;

namespace Core.Models
{
    public class PrescriptionDetail
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public ICollection<PrescriptionProductMapping>? ProductMappings { get; set; }
    }

    public class PrescriptionProductMapping
    {
        public Guid Id { get; set; }
        public Guid PrescriptionDetailId { get; set; }
        public Guid ProductId { get; set; }
        public bool IsChecked { get; set; } = false;
        public int? Quantity { get; set; }
        public string? Frequency { get; set; }
        public string? Directions { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public int? NumberOfDays { get; set; }
        public Guid? PurchaseOrderReceivingHistoryId { get; set; }
    }

    public class PrescriptionProductMappingWithProduct
    {
        public Guid Id { get; set; }
        public Guid PrescriptionDetailId { get; set; }
        public Guid ProductId { get; set; }
        public bool IsChecked { get; set; } = false;
        public int? Quantity { get; set; }
        public string? Frequency { get; set; }
        public string? Directions { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public int? NumberOfDays { get; set; }
        public Guid? PurchaseOrderReceivingHistoryId { get; set; }
        
        // Product details
        public Guid? Product_Id { get; set; }
        public string? Product_ProductNumber { get; set; }
        public string? Product_Name { get; set; }
        public string? Product_GenericName { get; set; }
        public string? Product_Category { get; set; }
        // Product type removed
        public string? Product_Manufacturer { get; set; }
        public string? Product_NdcNumber { get; set; }
        public string? Product_Strength { get; set; }
        public string? Product_DosageForm { get; set; }
        public string? Product_UnitOfMeasure { get; set; }
        public bool? Product_RequiresPrescription { get; set; }
        public string? Product_ControlledSubstanceSchedule { get; set; }
        public string? Product_BrandName { get; set; }
        public string? Product_StorageRequirements { get; set; }
        public bool? Product_IsActive { get; set; }
        public decimal? Product_Price { get; set; }
        public decimal? Product_SellingPrice { get; set; }
    }
} 