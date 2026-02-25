using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class PrescriptionDetailResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public ICollection<PrescriptionProductMappingDto>? ProductMappings { get; set; }
    }

    public class PrescriptionProductMappingDto
    {
        public Guid? Id { get; set; }
        public Guid? ProductId { get; set; }
        public bool IsChecked { get; set; } = false;
        public int? Quantity { get; set; }
        public string? Frequency { get; set; }
        public string? Directions { get; set; }
        public int? NumberOfDays { get; set; }
        public Guid? PurchaseOrderReceivingHistoryId { get; set; }
        public ProductDto? Product { get; set; }
        public PurchaseOrderReceivingHistoryResponseDto? PurchaseOrderReceivingHistory { get; set; }
    }

    public class CreatePrescriptionDetailRequestDto
    {
        public Guid VisitId { get; set; }
        public string? Notes { get; set; }
        public ICollection<CreatePrescriptionProductMappingDto>? ProductMappings { get; set; }
    }

    public class CreatePrescriptionProductMappingDto
    {
        public Guid ProductId { get; set; }
        public bool IsChecked { get; set; } = false;
        public int? Quantity { get; set; }
        public string? Frequency { get; set; }
        public string? Directions { get; set; }
        public int? NumberOfDays { get; set; }
        public Guid? PurchaseOrderReceivingHistoryId { get; set; }
    }

    public class UpdatePrescriptionDetailRequestDto
    {
        public Guid Id { get; set; }
        public string? Notes { get; set; }
        public ICollection<CreatePrescriptionProductMappingDto>? ProductMappings { get; set; }
    }
} 