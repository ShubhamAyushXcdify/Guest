using System;

namespace Core.Models
{
    public class VisitInvoice
    {
        public Guid Id { get; set; }
        public Guid? VisitId { get; set; }
        public Guid ClientId { get; set; }
        public Guid PatientId { get; set; }

        // Invoice fields (integers as requested)
        public string? InvoiceNumber { get; set; }
        public decimal? ItemsTotal { get; set; }
        public int? ConsultationFee { get; set; }
        public decimal? ConsultationDiscountPercentage { get; set; }
        public decimal? ConsultationDiscount { get; set; }
        public decimal? ConsultationFeeAfterDiscount { get; set; }
        public decimal? OverallProductDiscount { get; set; }
        public decimal? OverallProductDiscountPercentage { get; set; }
        public string? Notes { get; set; }
        public decimal? Total { get; set; }
        public string? Status { get; set; }
        public string PaymentMethod { get; set; }
        public Guid ClinicId { get; set; }

        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        // Not mapped collection for convenience; stored in separate table
        public System.Collections.Generic.List<VisitInvoiceProduct>? Products { get; set; }
    }
    
    public class VisitInvoiceProduct
    {
        public Guid Id { get; set; }
        public Guid VisitInvoiceId { get; set; }
        public Guid PurchaseOrderReceivingHistoryId { get; set; }
        public int Quantity { get; set; }
        public bool IsGiven { get; set; }
        public decimal? Discount { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}
