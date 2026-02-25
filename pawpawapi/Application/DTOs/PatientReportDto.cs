using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    /// <summary>
    /// Response DTO for PatientReport operations
    /// </summary>
    public class PatientReportResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public Guid CreatedById { get; set; }
        public string HtmlFile { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string CreatorName { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    /// <summary>
    /// Request DTO for creating PatientReport
    /// </summary>
    public class CreatePatientReportRequestDto
    {
        [Required(ErrorMessage = "Patient ID is required")]
        public Guid PatientId { get; set; }

        [Required(ErrorMessage = "Doctor ID is required")]
        public Guid DoctorId { get; set; }

        [Required(ErrorMessage = "Created By ID is required")]
        public Guid CreatedById { get; set; }

        [Required(ErrorMessage = "HTML File content is required")]
        public string HtmlFile { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request DTO for updating PatientReport
    /// </summary>
    public class UpdatePatientReportRequestDto
    {
        [Required(ErrorMessage = "ID is required")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "HTML File content is required")]
        public string HtmlFile { get; set; } = string.Empty;
    }
}

