using System;

namespace Application.DTOs
{
    public class ExpenseResponseDto
    {
        public Guid Id { get; set; }
        public Guid? ClinicId { get; set; }
        public DateTimeOffset DateOfExpense { get; set; }
        public string Category { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMode { get; set; }
        public string PaidTo { get; set; }
        public string? Description { get; set; }
        //public string Status { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public ClinicResponseDto? ClinicDetail { get; set; }
    }
}