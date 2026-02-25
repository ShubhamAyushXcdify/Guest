using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class DashboardSummaryDto
    {
         public int TotalPatients { get; set; }      
         public int TotalProducts { get; set; }   
         public List<ClinicDashboardDto> Clinics { get; set; }
    }

    public class SuperAdminDashboardDto
    {
        public List<CompanyDashboardDto> Companies { get; set; }
    }

    public class CompanyDashboardDto
    {
        public Guid CompanyId { get; set; }
        public string CompanyName { get; set; }
        public int NumberOfAdmins { get; set; }
        /// <summary>Most recent login from any user under this company (company-level or clinic users).</summary>
        public DateTimeOffset? LastLoginAt { get; set; }

    
        public List<ClinicDashboardDto> Clinics { get; set; }
    }

    public class ClinicDashboardDto
    {
        public string ClinicName { get; set; }
        public ClinicDetailsDto ClinicDetails { get; set; }
        public AppointmentCompletionRatiosDto AppointmentCompletionRatios { get; set; }
        public double? AverageRating { get; set; }
        public decimal? ServiceProfit { get; set; }
        public decimal? ProductProfit { get; set; }
    }

    public class ClinicDetailsDto
    {
        public int NumberOfVeterinarians { get; set; }
        public int NumberOfPatients { get; set; }
        public int NumberOfClients { get; set; }
        public int NumberOfProducts { get; set; }
        public int NumberOfSuppliers { get; set; }
    }

    public class AppointmentCompletionRatiosDto
    {
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CanceledAppointments { get; set; }
        public double CompletionRatio { get; set; }
        public string PercentageOfCompleting { get; set; }
    }

    /// <summary>
    /// DTO for weekly profit data
    /// </summary>
    public class WeeklyProfitDataDto
    {
        public string WeekLabel { get; set; } = string.Empty; // e.g., "Week 1", "Week 2"
        public string MonthYear { get; set; } = string.Empty; // e.g., "January 2024"
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal ServiceProfit { get; set; }
        public decimal ProductProfit { get; set; }
    }

    /// <summary>
    /// Response DTO for clinic weekly profit data
    /// </summary>
    public class ClinicWeeklyProfitResponseDto
    {
        public Guid ClinicId { get; set; }
        public string ClinicName { get; set; } = string.Empty;
        public List<WeeklyProfitDataDto> WeeklyData { get; set; } = new();
    }
} 