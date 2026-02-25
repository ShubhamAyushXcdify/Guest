using System;

namespace Application.DTOs
{
    public class UpdateSupplierRequestDto
    {
        public Guid Id { get; set; }
        public Guid? ClinicId { get; set; }
        public string Name { get; set; }
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? AccountNumber { get; set; }
        public string? PaymentTerms { get; set; }
        public bool? IsActive { get; set; }
    }
} 