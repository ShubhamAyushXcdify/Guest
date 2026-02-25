using System;

namespace Application.DTOs
{
    /// <summary>
    /// Single item in product usage (dispensed/given) history.
    /// </summary>
    public class ProductUsageHistoryItemDto
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
