using System;

namespace Application.DTOs
{
    public class PurchaseOrderReceivingHistoryFilterDto
    {
        public Guid? Id { get; set; }
        public Guid? PurchaseOrderId { get; set; }
        public Guid? PurchaseOrderItemId { get; set; }
        public Guid? ProductId { get; set; }
        public Guid? ClinicId { get; set; }
        public Guid? CompanyId { get; set; }
        public Guid? SupplierId { get; set; }
        public Guid? ReceivedBy { get; set; }
        public int? QuantityReceived { get; set; }
        public int? QuantityOnHand { get; set; }
        public string? BatchNumber { get; set; }
        public string? LotNumber { get; set; }
        public string? Barcode { get; set; }
        public string? Shelf { get; set; }
        public string? Bin { get; set; }
        public DateTime? ExpiryDateFrom { get; set; }
        public DateTime? ExpiryDateTo { get; set; }
        public DateTime? DateOfManufactureFrom { get; set; }
        public DateTime? DateOfManufactureTo { get; set; }
        public DateTime? ReceivedDateFrom { get; set; }
        public DateTime? ReceivedDateTo { get; set; }
        public decimal? UnitCostFrom { get; set; }
        public decimal? UnitCostTo { get; set; }
        public DateTimeOffset? CreatedFrom { get; set; }
        public DateTimeOffset? CreatedTo { get; set; }
        public DateTimeOffset? UpdatedFrom { get; set; }
        public DateTimeOffset? UpdatedTo { get; set; }
        public string? Notes { get; set; }
        public string? SortBy { get; set; } // id, received_date, created_at, etc.
        public string? SortOrder { get; set; } // asc, desc
        public int? PageNumber { get; set; }
        public int? PageSize { get; set; }
    }
}
