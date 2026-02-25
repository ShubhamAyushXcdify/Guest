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
    public class VaccinationReminderRepository : IVaccinationReminderRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<VaccinationReminderRepository> _logger;

        public VaccinationReminderRepository(DapperDbContext dbContext, ILogger<VaccinationReminderRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<List<VaccinationReminder>> GetVaccinationRemindersDueAsync(DateTimeOffset startDate, DateTimeOffset endDate)
        {
            const string sql = @"
                SELECT 
                    vdm.vaccination_detail_id AS VaccinationDetailId,
                    vdm.vaccination_master_id AS VaccinationMasterId,
                    vdm.vaccination_json AS VaccinationJson,
                    
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
                    COALESCE(comp.name, cl.name) AS CompanyName,
                    
                    vm.disease AS VaccineDisease,
                    vm.vaccine_type AS VaccineType
                FROM 
                    vaccination_detail_masters vdm
                INNER JOIN 
                    vaccination_details vd ON vdm.vaccination_detail_id = vd.id
                INNER JOIN 
                    visits v ON vd.visit_id = v.id
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
                INNER JOIN 
                    vaccination_master vm ON vdm.vaccination_master_id = vm.id
                WHERE 
                    -- Only active clients, patients
                    c.is_active = true
                    AND p.is_active = true
                    -- Only completed appointments
                    AND LOWER(a.status) = 'completed'
                    -- Must have vaccination JSON data
                    AND vdm.vaccination_json IS NOT NULL
                    AND vdm.vaccination_json != ''
                    -- Must have client email
                    AND c.email IS NOT NULL
                    AND c.email != ''
                ORDER BY 
                    vdm.vaccination_detail_id, vdm.vaccination_master_id;
            ";

            try
            {
                _logger.LogInformation("Fetching vaccination reminders from database for date range {StartDate} to {EndDate}", startDate, endDate);
                
                using var connection = _dbContext.GetConnection();
                var allReminders = await connection.QueryAsync<VaccinationReminder>(sql);
                
                _logger.LogInformation("Successfully fetched {Count} vaccination records from database", allReminders.Count());
                
                // Filter by date range based on nextDueDate in JSON
                // We need to parse the JSON and check the nextDueDate
                var filteredReminders = new List<VaccinationReminder>();
                
                foreach (var reminder in allReminders)
                {
                    try
                    {
                        // Parse the vaccination JSON to get the nextDueDate
                        var jsonData = System.Text.Json.JsonSerializer.Deserialize<VaccinationJsonData>(
                            reminder.VaccinationJson,
                            new System.Text.Json.JsonSerializerOptions 
                            { 
                                PropertyNameCaseInsensitive = true 
                            }
                        );

                        if (jsonData != null && jsonData.NextDueDate >= startDate && jsonData.NextDueDate <= endDate)
                        {
                            filteredReminders.Add(reminder);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, 
                            "Failed to parse vaccination JSON for VaccinationDetailId: {VaccinationDetailId}, VaccinationMasterId: {VaccinationMasterId}", 
                            reminder.VaccinationDetailId, reminder.VaccinationMasterId);
                    }
                }

                return filteredReminders;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching vaccination reminders between {StartDate} and {EndDate}", startDate, endDate);
                throw;
            }
        }
    }
}

