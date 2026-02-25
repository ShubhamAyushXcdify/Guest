using System;

namespace Application.DTOs
{
    public class ExpiringProductsResponseDto
    {
        public Guid InventoryId { get; set; }
        public Guid ProductId { get; set; }
        public Guid ClinicId { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public DateTime? DateOfManufacture { get; set; }
        public int QuantityOnHand { get; set; }
        public string? BatchNumber { get; set; }
        public string? LotNumber { get; set; }
        public string? Location { get; set; }
        public decimal? UnitCost { get; set; }
        public decimal? WholesaleCost { get; set; }
        public decimal? RetailPrice { get; set; }
        public DateTime? ReceivedDate { get; set; }
        
        // Product details
        public ProductDto? Product { get; set; }
        
        // Branch/Clinic details
        public ClinicResponseDto? Clinic { get; set; }
    }
}
