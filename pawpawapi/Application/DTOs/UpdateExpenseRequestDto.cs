using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class UpdateExpenseRequestDto
    {
        [Required]
        public Guid Id { get; set; }

        [Required]
        public Guid? ClinicId { get; set; }

        [Required]
        public DateTimeOffset DateOfExpense { get; set; }

        [Required]
        [StringLength(100)]
        public string Category { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(50)]
        public string PaymentMode { get; set; }

        [Required]
        [StringLength(200)]
        public string PaidTo { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        //[Required]
        //[StringLength(50)]
        //public string Status { get; set; }
    }
}