using System;

namespace Core.Models
{
    /// <summary>
    /// Represents a single row of product usage (dispensed/given) history for reporting.
    /// </summary>
    public class ProductUsageHistoryRow
    {
        public string? ClinicName { get; set; }
        public string? ClientName { get; set; }
        public string? PatientName { get; set; }
        public int QuantityGiven { get; set; }
        public string? DoseFrequency { get; set; }
        public int? NumberOfDaysGiven { get; set; }
        public string? AppointmentType { get; set; }
        public DateTime? DateGiven { get; set; }
    }
}
