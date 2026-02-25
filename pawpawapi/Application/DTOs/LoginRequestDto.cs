using System.ComponentModel;

namespace Application.DTOs
{
    public class LoginRequestDto
    {
        [DefaultValue("devadmin@pawpaw.com")]
        public string Email { get; set; } = "devadmin@pawpaw.com";
        
        [DefaultValue("admin123")]
        public string Password { get; set; } = "admin123";
    }
} 