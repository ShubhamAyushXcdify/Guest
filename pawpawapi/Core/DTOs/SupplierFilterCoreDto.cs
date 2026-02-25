using System;

namespace Core.DTOs
{
    public class SupplierFilterCoreDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public Guid? ClinicId { get; set; }
        public Guid? CompanyId { get; set; }
        public string? Name { get; set; }
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ClinicName { get; set; }
        public string? Phone { get; set; }
    }
}
