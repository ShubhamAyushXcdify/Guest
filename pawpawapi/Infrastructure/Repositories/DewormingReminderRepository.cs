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
    public class DewormingReminderRepository : IDewormingReminderRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<DewormingReminderRepository> _logger;

        public DewormingReminderRepository(DapperDbContext dbContext, ILogger<DewormingReminderRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<List<DewormingReminder>> GetDewormingRemindersDueAsync(DateTimeOffset startDate, DateTimeOffset endDate)
        {
            const string sql = @"
                SELECT 
                    dc.id AS DewormingCheckoutId,
                    dc.visit_id AS VisitId,
                    dc.next_deworming_due_date AS NextDewormingDueDate,
                    dc.summary AS Summary,
                    dc.home_care_instructions AS HomeCareInstructions,
                    
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
                    deworming_checkout dc
                INNER JOIN 
                    visits v ON dc.visit_id = v.id
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
                    -- Must have next deworming due date
                    AND dc.next_deworming_due_date IS NOT NULL
                    -- Filter by date range
                    AND DATE(dc.next_deworming_due_date) >= DATE(@StartDate)
                    AND DATE(dc.next_deworming_due_date) <= DATE(@EndDate)
                    -- Must have client email
                    AND c.email IS NOT NULL
                    AND c.email != ''
                    -- Only completed deworming checkouts
                    AND dc.is_completed = true
                ORDER BY 
                    dc.next_deworming_due_date, c.email;
            ";

            try
            {
                _logger.LogInformation("Fetching deworming reminders from database for date range {StartDate} to {EndDate}", startDate, endDate);
                
                // Convert to UTC to avoid PostgreSQL timezone offset errors
                var startDateUtc = startDate.UtcDateTime;
                var endDateUtc = endDate.UtcDateTime;
                
                using var connection = _dbContext.GetConnection();
                var reminders = await connection.QueryAsync<DewormingReminder>(sql, new { StartDate = startDateUtc, EndDate = endDateUtc });
                
                _logger.LogInformation("Successfully fetched {Count} deworming reminders from database", reminders.Count());
                
                return reminders.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching deworming reminders between {StartDate} and {EndDate}", startDate, endDate);
                throw;
            }
        }
    }
}

