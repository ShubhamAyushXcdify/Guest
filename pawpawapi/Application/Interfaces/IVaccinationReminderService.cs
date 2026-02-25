using Application.DTOs;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IVaccinationReminderService
    {
        /// <summary>
        /// Processes and sends vaccination reminder emails for all due vaccinations
        /// This method should be called by the background job/cron service
        /// </summary>
        /// <returns>A task representing the result of the vaccination reminder processing</returns>
        Task<ReminderResponseDto> ProcessVaccinationRemindersAsync();
    }
}

