using Application.Interfaces;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace Application.Services
{
    /// <summary>
    /// Placeholder SMS service implementation. 
    /// TODO: Implement with actual SMS provider (Twilio, AWS SNS, etc.)
    /// </summary>
    public class SmsService : ISmsService
    {
        private readonly ILogger<SmsService> _logger;

        public SmsService(ILogger<SmsService> logger)
        {
            _logger = logger;
        }

        public async Task<bool> SendSmsAsync(string phoneNumber, string message)
        {
            // TODO: Implement actual SMS sending via Twilio, AWS SNS, or other provider
            _logger.LogInformation("SMS Service (Placeholder): Would send SMS to {PhoneNumber} with message: {Message}", phoneNumber, message);
            
            // For now, just log and return true (simulating success)
            // In production, replace this with actual SMS API call
            await Task.CompletedTask;
            return true;
        }
    }
}
