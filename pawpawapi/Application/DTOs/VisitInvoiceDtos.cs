using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class VisitInvoiceResponseDto
    {
        public Guid Id { get; set; }
        public Guid? VisitId { get; set; }
        public Guid ClientId { get; set; }
        public Guid PatientId { get; set; }

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

        // Expanded related details
        public ClientResponseDto? Client { get; set; }
        public PatientResponseDto? Patient { get; set; }

        // Products dispensed/billed with this invoice
        public List<VisitInvoiceProductResponseDto>? Products { get; set; }
    }

    public class CreateVisitInvoiceRequestDto
    {
        public Guid? VisitId { get; set; }
        [Required]
        public Guid ClientId { get; set; }
        [Required]
        public Guid PatientId { get; set; }

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
        public string? PaymentMethod { get; set; }
        [Required]
        public Guid ClinicId { get; set; }

        // Optional products associated to this invoice
        public List<VisitInvoiceProductRequestDto>? Products { get; set; }
    }

    public class UpdateVisitInvoiceRequestDto
    {
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
        public string? PaymentMethod { get; set; }
        public Guid? ClinicId { get; set; }

        // Replace or upsert products for this invoice
        public List<VisitInvoiceProductRequestDto>? Products { get; set; }
    }

    public class VisitInvoiceProductRequestDto
    {
        [Required]
        public Guid PurchaseOrderReceivingHistoryId { get; set; }
        [Required]
        public int Quantity { get; set; }
        public bool IsGiven { get; set; }
        public decimal? Discount { get; set; }
        public decimal? DiscountPercentage { get; set; }
    }

    public class VisitInvoiceProductResponseDto
    {
        public Guid Id { get; set; }
        public Guid PurchaseOrderReceivingHistoryId { get; set; }
        public int Quantity { get; set; }
        public bool IsGiven { get; set; }
        public decimal? Discount { get; set; }
        public decimal? DiscountPercentage { get; set; }

        // Enriched details
        public PurchaseOrderReceivingHistoryResponseDto? ReceivingHistory { get; set; }
        public ProductDto? Product { get; set; }
    }
}
