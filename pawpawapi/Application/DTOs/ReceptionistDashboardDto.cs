using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class ReceptionistDashboardDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string ClinicName { get; set; }
        public Guid? ClinicId { get; set; }
        public ReceptionistDetailsDto ReceptionistDetails { get; set; }
        public AppointmentManagementDto AppointmentManagement { get; set; }
        public ClientManagementDto ClientManagement { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class ReceptionistDetailsDto
    {
        public int TotalAppointmentsScheduled { get; set; }
        public int AppointmentsToday { get; set; }
        public int WalkInPatients { get; set; }
        public int PendingRegistrations { get; set; }
        public int CompletedCheckIns { get; set; }
    }

    public class AppointmentManagementDto
    {
        public int TotalAppointments { get; set; }
        public int ConfirmedAppointments { get; set; }
        public int PendingConfirmations { get; set; }
        public int CancelledAppointments { get; set; }
        public int RescheduledAppointments { get; set; }
        public double ConfirmationRate { get; set; }
        public string ConfirmationPercentage { get; set; }
    }

    public class ClientManagementDto
    {
        public int TotalClients { get; set; }
        public int NewClientsThisMonth { get; set; }
        public int ActiveClients { get; set; }
        public int ClientsWithPendingPayments { get; set; }
        public int ClientsRequiringFollowUp { get; set; }
    }
} 