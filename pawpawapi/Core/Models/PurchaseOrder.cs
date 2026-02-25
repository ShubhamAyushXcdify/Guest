using System;

namespace Core.Models
{
    public class PurchaseOrder
    {
        public Guid Id { get; set; }
        public Guid? ClinicId { get; set; }
        public Guid? SupplierId { get; set; }
        public string OrderNumber { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public DateTime? ActualDeliveryDate { get; set; }
        public string? Status { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? DiscountedAmount { get; set; }
        public decimal? ExtendedAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? Notes { get; set; }
        public byte[]? PdfData { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
} 