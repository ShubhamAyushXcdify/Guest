using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    /// <summary>
    /// Response DTO for IntakeFile operations
    /// </summary>
    public class IntakeFileResponseDto
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
    /// Request DTO for uploading IntakeFile
    /// </summary>
    public class UploadIntakeFileRequestDto
    {
        [Required(ErrorMessage = "Intake Detail ID is required")]
        public Guid IntakeDetailId { get; set; }

        [Required(ErrorMessage = "File name is required")]
        [StringLength(255, ErrorMessage = "File name cannot exceed 255 characters")]
        public string FileName { get; set; } = string.Empty;

        public string FilePath { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "File type cannot exceed 50 characters")]
        public string FileType { get; set; } = string.Empty;

        [Range(1, 10L * 1024 * 1024 * 1024, ErrorMessage = "File size must be between 1 byte and 10GB")]
        public long FileSize { get; set; }
    }
}