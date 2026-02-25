using System;

namespace Application.DTOs
{
    public class PrescriptionPdfResponseDto
    {
        public Guid VisitId { get; set; }
        public string PdfBase64 { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        
        // Summary information
        public string? PatientName { get; set; }
        public string? ClientName { get; set; }
        public string? ComplaintsSummary { get; set; }
        public int PrescriptionItemsCount { get; set; }
    }
}
