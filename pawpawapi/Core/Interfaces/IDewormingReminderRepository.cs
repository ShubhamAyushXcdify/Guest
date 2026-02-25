using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IDewormingReminderRepository
    {
        /// <summary>
        /// Gets all deworming reminders that are due within the specified date range
        /// Only includes reminders where client, patient, and appointment are active and appointment is completed
        /// </summary>
        /// <param name="startDate">Start date for the reminder range</param>
        /// <param name="endDate">End date for the reminder range</param>
        /// <returns>List of deworming reminders</returns>
        Task<List<DewormingReminder>> GetDewormingRemindersDueAsync(DateTimeOffset startDate, DateTimeOffset endDate);
    }
}

