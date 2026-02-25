using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class VeterinarianDashboardDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string ClinicName { get; set; }
        public Guid? ClinicId { get; set; }
        public VeterinarianDetailsDto VeterinarianDetails { get; set; }
        public AppointmentStatisticsDto AppointmentStatistics { get; set; }
        public PatientStatisticsDto PatientStatistics { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class VeterinarianDetailsDto
    {
        public int TotalPatientsAssigned { get; set; }
        public int ActivePatients { get; set; }
        public int CompletedVisits { get; set; }
        public int PendingAppointments { get; set; }
        public int TodayAppointments { get; set; }
    }

    public class AppointmentStatisticsDto
    {
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CanceledAppointments { get; set; }
        public int PendingAppointments { get; set; }
        public double CompletionRatio { get; set; }
        public string CompletionPercentage { get; set; }
    }

    public class PatientStatisticsDto
    {
        public int TotalPatients { get; set; }
        public int NewPatientsThisMonth { get; set; }
        public int PatientsWithActiveTreatment { get; set; }
        public int PatientsRequiringFollowUp { get; set; }
    }
} 