using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class ClinicAdminDashboardDto
    {
        public Guid ClinicId { get; set; }
        public string ClinicName { get; set; }
        public ClinicDetailsDto ClinicDetails { get; set; }
        public AppointmentCompletionRatiosDto AppointmentCompletionRatios { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public InventoryDashboardResponseDto InventoryDashboard { get; set; }
        public double? AverageRating { get; set; }
        public decimal? ServiceProfit { get; set; }
        public decimal? ProductProfit { get; set; }
        
        // Client activity within selected duration (if from/to are provided)
        public int NewClientsAddedCount { get; set; }
        public int ClientsMovedOutCount { get; set; }
    }
}
