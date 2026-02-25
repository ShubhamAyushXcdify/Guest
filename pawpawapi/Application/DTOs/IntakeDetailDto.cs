using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    /// <summary>
    /// Response DTO for IntakeDetail operations
    /// </summary>
    public class IntakeDetailResponseDto
    {
        public Guid Id { get; set; }
        public Guid VisitId { get; set; }
        public decimal? WeightKg { get; set; }
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public ICollection<IntakeFileResponseDto>? Files { get; set; }
    }

    /// <summary>
    /// Request DTO for creating IntakeDetail
    /// </summary>
    public class CreateIntakeDetailRequestDto
    {
        [Required(ErrorMessage = "Visit ID is required")]
        public Guid VisitId { get; set; }

        [Range(0.01, 1000, ErrorMessage = "Weight must be between 0.01 and 1000 kg")]
        public decimal? WeightKg { get; set; }

        [StringLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters")]
        public string? Notes { get; set; }

        public bool IsCompleted { get; set; }

        public ICollection<CreateIntakeFileRequestDto>? Files { get; set; }
    }

    /// <summary>
    /// Request DTO for updating IntakeDetail
    /// </summary>
    public class UpdateIntakeDetailRequestDto
    {
        [Required(ErrorMessage = "ID is required")]
        public Guid Id { get; set; }

        [Range(0.01, 1000, ErrorMessage = "Weight must be between 0.01 and 1000 kg")]
        public decimal? WeightKg { get; set; }

        [StringLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters")]
        public string? Notes { get; set; }

        public bool IsCompleted { get; set; }

        public ICollection<CreateIntakeFileRequestDto>? Files { get; set; }
    }

    /// <summary>
    /// Request DTO for creating IntakeFile
    /// </summary>
    public class CreateIntakeFileRequestDto
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
    public class DeleteFileResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}