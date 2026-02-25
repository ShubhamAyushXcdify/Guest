using System;

namespace Application.DTOs
{
    public class ClientFilterDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Type { get; set; }
        public string? Query { get; set; }
        public Guid? CompanyId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? PhonePrimary { get; set; }
        public string? PhoneSecondary { get; set; }
    }
}
