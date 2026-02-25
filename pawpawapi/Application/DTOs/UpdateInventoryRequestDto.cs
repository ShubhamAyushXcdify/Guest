using System;

namespace Application.DTOs
{
    public class UpdateInventoryRequestDto
    {
        public Guid Id { get; set; }
        public Guid? ClinicId { get; set; }
        public Guid? ProductId { get; set; }
        public string? LotNumber { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public DateTime? DateOfManufacture { get; set; }
        public int QuantityOnHand { get; set; }
        public int? QuantityReserved { get; set; }
        public int? ReorderLevel { get; set; }
        public int? ReorderQuantity { get; set; }
        public decimal? UnitCost { get; set; }
        public decimal? WholesaleCost { get; set; }
        public decimal? RetailPrice { get; set; }
        public string? UnitOfMeasure { get; set; }
        public int? UnitsPerPackage { get; set; }
        public string? Location { get; set; }
        public bool? ReceivedFromPo { get; set; }
        public Guid? PoItemId { get; set; }
        public DateTime? ReceivedDate { get; set; }
    }
} 