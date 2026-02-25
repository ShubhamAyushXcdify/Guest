using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IEmergencyDischargeReminderRepository
    {
        /// <summary>
        /// Gets all emergency discharge reminders that are due within the specified date range
        /// Only includes reminders where client, patient, and appointment are active and appointment is completed
        /// </summary>
        /// <param name="startDate">Start date for the reminder range</param>
        /// <param name="endDate">End date for the reminder range</param>
        /// <returns>List of emergency discharge reminders</returns>
        Task<List<EmergencyDischargeReminder>> GetEmergencyDischargeRemindersDueAsync(DateTime startDate, DateTime endDate);
    }
}
