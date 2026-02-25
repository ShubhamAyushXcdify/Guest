using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class UpdatePurchaseOrderRequestDto
    {
        public Guid Id { get; set; }
        public Guid? ClinicId { get; set; }
        public Guid? SupplierId { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public string? Status { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? DiscountedAmount { get; set; }
        public decimal? ExtendedAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? Notes { get; set; }
        public Guid? CreatedBy { get; set; }
        public List<UpdatePurchaseOrderItemRequestDto> Items { get; set; } = new List<UpdatePurchaseOrderItemRequestDto>();
    }
} 