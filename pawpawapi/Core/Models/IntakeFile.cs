using System;

namespace Core.Models
{
    public class IntakeFile
    {
        public Guid Id { get; set; }
        public Guid IntakeDetailId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public IntakeDetail? IntakeDetail { get; set; }
    }
} 