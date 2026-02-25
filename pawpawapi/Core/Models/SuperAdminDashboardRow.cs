using System;

namespace Core.Models
{
    /// <summary>
    /// One row from the single-query super-admin dashboard: company + clinic (nullable) with all aggregated counts.
    /// </summary>
    public class SuperAdminDashboardRow
    {
        public Guid CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public Guid? ClinicId { get; set; }
        public string? ClinicName { get; set; }
        public int AdminCount { get; set; }
        public DateTimeOffset? LastLoginAt { get; set; }
        public int PatientCount { get; set; }
        public int ClientCount { get; set; }
        public int ProductCount { get; set; }
        public int VetCount { get; set; }
        public int SupplierCount { get; set; }
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CanceledAppointments { get; set; }
    }
}
