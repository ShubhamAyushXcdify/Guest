using System.Threading.Tasks;

namespace Application.Interfaces
{
    /// <summary>
    /// Service interface for sending SMS messages (e.g., OTP via Twilio, AWS SNS, etc.)
    /// </summary>
    public interface ISmsService
    {
        /// <summary>
        /// Send SMS message to a phone number
        /// </summary>
        /// <param name="phoneNumber">Phone number in E.164 format (e.g., +1234567890)</param>
        /// <param name="message">Message content</param>
        /// <returns>True if sent successfully, false otherwise</returns>
        Task<bool> SendSmsAsync(string phoneNumber, string message);
    }
}
