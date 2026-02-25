using System;

namespace Core.Models
{
    public class ClientDeletionOtp
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public string Otp { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
