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
    public class SurgeryDischargeReminderRepository : ISurgeryDischargeReminderRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<SurgeryDischargeReminderRepository> _logger;

        public SurgeryDischargeReminderRepository(DapperDbContext dbContext, ILogger<SurgeryDischargeReminderRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<List<SurgeryDischargeReminder>> GetSurgeryDischargeRemindersDueAsync(DateTime startDate, DateTime endDate)
        {
            const string sql = @"
                SELECT 
                    sd.id AS SurgeryDischargeId,
                    sd.visit_id AS VisitId,
                    sd.followup_date AS FollowupDate,
                    sd.discharge_status AS DischargeStatus,
                    sd.home_care_instructions AS HomeCareInstructions,
                    sd.medications_to_go_home AS MedicationsToGoHome,
                    sd.follow_up_instructions AS FollowUpInstructions,
                    
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
                    surgery_discharge sd
                INNER JOIN 
                    visits v ON sd.visit_id = v.id
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
                    AND sd.followup_date IS NOT NULL
                    -- Must have client email
                    AND c.email IS NOT NULL
                    AND c.email != ''
                    -- Followup date is within the specified range
                    AND sd.followup_date::date >= @StartDate::date
                    AND sd.followup_date::date <= @EndDate::date
                ORDER BY 
                    sd.followup_date, c.email;
            ";

            try
            {
                _logger.LogInformation("Fetching surgery discharge reminders from database for date range {StartDate} to {EndDate}", startDate, endDate);
                
                using var connection = await _dbContext.CreateConnectionAsync();
                var reminders = await connection.QueryAsync<SurgeryDischargeReminder>(sql, new { StartDate = startDate, EndDate = endDate });
                
                var reminderList = reminders.ToList();
                _logger.LogInformation("Successfully fetched {Count} surgery discharge reminders from database", reminderList.Count);

                return reminderList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching surgery discharge reminders between {StartDate} and {EndDate}", startDate, endDate);
                throw;
            }
        }
    }
}
