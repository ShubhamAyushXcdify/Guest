using System;

namespace Core.Models
{
    public class PasswordResetOtp
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string Otp { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}