using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class ProviderDashboardSummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public string Specialty { get; set; }
        public string? AvatarUrl { get; set; }
        public int Total { get; set; }
        public int Done { get; set; }
        public int Pending { get; set; }
        public List<AppointmentResponseDto> Appointments { get; set; } = new List<AppointmentResponseDto>();
    }
}