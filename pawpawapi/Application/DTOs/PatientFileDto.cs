using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    /// <summary>
    /// Response DTO for PatientFile operations
    /// </summary>
    public class PatientFileResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public Guid? VisitId { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid CreatedBy { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public ICollection<PatientFileAttachmentResponseDto>? Attachments { get; set; }
    }

    /// <summary>
    /// Response DTO for PatientFileAttachment operations
    /// </summary>
    public class PatientFileAttachmentResponseDto
    {
        public Guid Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    /// <summary>
    /// Request DTO for creating PatientFile
    /// </summary>
    public class CreatePatientFileRequestDto
    {
        [Required(ErrorMessage = "Patient ID is required")]
        public Guid PatientId { get; set; }

        public Guid? VisitId { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(255, ErrorMessage = "Name cannot exceed 255 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Created By is required")]
        public Guid CreatedBy { get; set; }

        public ICollection<CreatePatientFileAttachmentDto>? Files { get; set; }
    }

    /// <summary>
    /// Request DTO for updating PatientFile
    /// </summary>
    public class UpdatePatientFileRequestDto
    {
        [Required(ErrorMessage = "ID is required")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(255, ErrorMessage = "Name cannot exceed 255 characters")]
        public string Name { get; set; } = string.Empty;

        public Guid? VisitId { get; set; }

        public ICollection<CreatePatientFileAttachmentDto>? Files { get; set; }
    }

    /// <summary>
    /// Request DTO for creating PatientFile attachment
    /// </summary>
    public class CreatePatientFileAttachmentDto
    {
        [Required(ErrorMessage = "File name is required")]
        [StringLength(255, ErrorMessage = "File name cannot exceed 255 characters")]
        public string FileName { get; set; } = string.Empty;

        public string FilePath { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "File type cannot exceed 50 characters")]
        public string FileType { get; set; } = string.Empty;

        [Range(1, 10L * 1024 * 1024 * 1024, ErrorMessage = "File size must be between 1 byte and 10GB")]
        public long FileSize { get; set; }

        public byte[] FileData { get; set; } = Array.Empty<byte>();
    }

    /// <summary>
    /// Response DTO for file operations
    /// </summary>
    public class DeletePatientFileResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}

