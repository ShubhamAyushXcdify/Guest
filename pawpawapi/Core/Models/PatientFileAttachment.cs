using System;

namespace Core.Models
{
    public class PatientFileAttachment
    {
        public Guid Id { get; set; }
        public Guid PatientFileId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public PatientFile? PatientFile { get; set; }
    }
}

