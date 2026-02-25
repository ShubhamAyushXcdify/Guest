using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class EmergencyDischargeReminderRepository : IEmergencyDischargeReminderRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<EmergencyDischargeReminderRepository> _logger;

        public EmergencyDischargeReminderRepository(DapperDbContext dbContext, ILogger<EmergencyDischargeReminderRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<List<EmergencyDischargeReminder>> GetEmergencyDischargeRemindersDueAsync(DateTime startDate, DateTime endDate)
        {
            const string sql = @"
                SELECT 
                    ed.id AS EmergencyDischargeId,
                    ed.visit_id AS VisitId,
                    ed.followup_date AS FollowupDate,
                    ed.discharge_status AS DischargeStatus,
                    ed.discharge_summary AS DischargeSummary,
                    ed.home_care_instructions AS HomeCareInstructions,
                    ed.followup_instructions AS FollowupInstructions,
                    ed.responsible_clinician AS ResponsibleClinician,
                    
                    c.id AS ClientId,
                    c.email AS ClientEmail,
                    c.first_name AS ClientFirstName,
                    c.last_name AS ClientLastName,
                    
                    p.id AS PatientId,
                    p.name AS PatientName,
                    p.species AS PatientSpecies,
                    p.breed AS PatientBreed,
                    
                    a.id AS AppointmentId,
                    
                    cl.id AS ClinicId,
                    cl.name AS ClinicName,
                    cl.phone AS ClinicPhone,
                    cl.email AS ClinicEmail,
                    CONCAT_WS(', ', cl.address_line1, cl.city, cl.state, cl.postal_code) AS ClinicAddress,
                    
                    COALESCE(comp.id, '00000000-0000-0000-0000-000000000000'::uuid) AS CompanyId,
                    COALESCE(comp.name, cl.name) AS CompanyName
                FROM 
                    emergency_discharge ed
                INNER JOIN 
                    visits v ON ed.visit_id = v.id
                INNER JOIN 
                    appointments a ON v.appointment_id = a.id
                INNER JOIN 
                    clients c ON a.client_id = c.id
                INNER JOIN 
                    patients p ON a.patient_id = p.id
                INNER JOIN 
                    clinics cl ON a.clinic_id = cl.id
                LEFT JOIN 
                    company comp ON cl.company_id = comp.id
                WHERE 
                    -- Only active clients, patients
                    c.is_active = true
                    AND p.is_active = true
                    -- Only completed appointments
                    AND LOWER(a.status) = 'completed'
                    -- Must have followup date
                    AND ed.followup_date IS NOT NULL
                    -- Must have client email
                    AND c.email IS NOT NULL
                    AND c.email != ''
                    -- Followup date is within the specified range
                    AND ed.followup_date::date >= @StartDate::date
                    AND ed.followup_date::date <= @EndDate::date

                ORDER BY 
                    ed.followup_date, c.email;
            ";

            try
            {
                _logger.LogInformation("Fetching emergency discharge reminders from database for date range {StartDate} to {EndDate}", startDate, endDate);
                
                using var connection = await _dbContext.CreateConnectionAsync();
                var reminders = await connection.QueryAsync<EmergencyDischargeReminder>(sql, new { StartDate = startDate, EndDate = endDate });
                
                var reminderList = reminders.ToList();
                _logger.LogInformation("Successfully fetched {Count} emergency discharge reminders from database", reminderList.Count);

                return reminderList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching emergency discharge reminders between {StartDate} and {EndDate}", startDate, endDate);
                throw;
            }
        }
    }
}
