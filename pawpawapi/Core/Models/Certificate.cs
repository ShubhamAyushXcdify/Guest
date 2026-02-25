using System;

namespace Core.Models
{
    public class Certificate
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public Guid? CertificateTypeId { get; set; }
        public string CertificateTypeName { get; set; }
        public string CertificateJson { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
} 