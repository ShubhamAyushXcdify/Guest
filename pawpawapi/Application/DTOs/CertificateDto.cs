using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    /// <summary>
    /// Response DTO for a single certificate
    /// </summary>
    public class CertificateResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public Guid? CertificateTypeId { get; set; }
        public string CertificateTypeName { get; set; }
        public string CertificateJson { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Response DTO containing visit with all its certificates
    /// </summary>
    public class CertificatesByVisitResponseDto
    {
        public Guid VisitId { get; set; }
        public List<CertificateItemResponseDto> Certificates { get; set; } = new List<CertificateItemResponseDto>();
    }

    /// <summary>
    /// Individual certificate item in response
    /// </summary>
    public class CertificateItemResponseDto
    {
        public Guid Id { get; set; }
        public Guid? CertificateTypeId { get; set; }
        public string CertificateTypeName { get; set; }
        public string CertificateJson { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Request DTO for creating certificates (accepts array)
    /// </summary>
    public class CreateCertificateRequestDto
    {
        [Required(ErrorMessage = "VisitId is required")]
        public Guid VisitId { get; set; }

        [Required(ErrorMessage = "Certificates array is required")]
        public List<CertificateItemRequestDto> Certificates { get; set; } = new List<CertificateItemRequestDto>();
    }

    /// <summary>
    /// Individual certificate item in request
    /// </summary>
    public class CertificateItemRequestDto
    {
        public Guid? CertificateTypeId { get; set; }

        [Required(ErrorMessage = "CertificateJson is required")]
        [MaxLength(10000, ErrorMessage = "CertificateJson cannot exceed 10000 characters")]
        public string CertificateJson { get; set; }
    }

    /// <summary>
    /// Request DTO for updating certificates (accepts array)
    /// </summary>
    public class UpdateCertificateRequestDto
    {
        [Required(ErrorMessage = "VisitId is required")]
        public Guid VisitId { get; set; }

        [Required(ErrorMessage = "Certificates array is required")]
        public List<UpdateCertificateItemRequestDto> Certificates { get; set; } = new List<UpdateCertificateItemRequestDto>();
    }

    /// <summary>
    /// Individual certificate item for update (includes optional Id for existing items)
    /// </summary>
    public class UpdateCertificateItemRequestDto
    {
        public Guid? Id { get; set; }
        public Guid? CertificateTypeId { get; set; }

        [Required(ErrorMessage = "CertificateJson is required")]
        [MaxLength(10000, ErrorMessage = "CertificateJson cannot exceed 10000 characters")]
        public string CertificateJson { get; set; }
    }
}
