namespace Application.DTOs
{
    public class LoginResponseDto
    {
        public string Token { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
        public UserResponseDto User { get; set; }
        public int RolePriority { get; set; }
    }
} 