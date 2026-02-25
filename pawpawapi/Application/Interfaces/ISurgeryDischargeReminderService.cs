using Application.DTOs;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ISurgeryDischargeReminderService
    {
        /// <summary>
        /// Processes and sends surgery discharge reminder emails for all due follow-up dates
        /// This method should be called by the background job/cron service
        /// </summary>
        /// <returns>A task representing the result of the surgery discharge reminder processing</returns>
        Task<ReminderResponseDto> ProcessSurgeryDischargeRemindersAsync();
    }
}
