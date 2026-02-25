using System;

namespace Application.DTOs
{
    public class UpdateReceivedItemRequestDto
    {
        public Guid PurchaseOrderItemId { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public DateTime? DateOfManufacture { get; set; }
        public string? Notes { get; set; }
    }
} 