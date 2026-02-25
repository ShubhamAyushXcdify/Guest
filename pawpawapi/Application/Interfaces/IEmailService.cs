using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body, string from = "info@xcdify.com");
        Task SendEmailWithAttachmentAsync(string to, string subject, string body, byte[] attachmentData, string attachmentName, string from = "info@xcdify.com");
    }
} 