using Application.DTOs;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IDewormingReminderService
    {
        /// <summary>
        /// Processes and sends deworming reminder emails for all due dewormings
        /// This method should be called by the background job/cron service
        /// </summary>
        /// <returns>A task representing the result of the deworming reminder processing</returns>
        Task<ReminderResponseDto> ProcessDewormingRemindersAsync();
    }
}

