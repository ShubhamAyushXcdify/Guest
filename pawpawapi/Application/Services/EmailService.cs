using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System;

namespace Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _apiKey;
        private readonly HttpClient _httpClient;

        public EmailService(IConfiguration config)
        {
            _apiKey = config["Resend:ApiKey"];
            _httpClient = new HttpClient();
            _httpClient.BaseAddress = new System.Uri("https://api.resend.com/");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }

        public async Task SendEmailAsync(string to, string subject, string body, string from = "Pawtrack -- <info@xcdify.com>")
        {
            var payload = new
            {
                from = from,
                to = to,
                subject = subject,
                html = body
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("emails", content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new System.InvalidOperationException($"Failed to send email: {error}");
            }
        }

        public async Task SendEmailWithAttachmentAsync(string to, string subject, string body, byte[] attachmentData, string attachmentName, string from = "Pawtrack -- <info@xcdify.com>")
        {
            // Convert attachment to base64
            var attachmentBase64 = Convert.ToBase64String(attachmentData);

            var payload = new
            {
                from = from,
                to = to,
                subject = subject,
                html = body,
                attachments = new[]
                {
                    new
                    {
                        filename = attachmentName,
                        content = attachmentBase64
                    }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("emails", content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new System.InvalidOperationException($"Failed to send email with attachment: {error}");
            }
        }
    }
}