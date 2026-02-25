// RequestResetPasswordDto.cs
public class RequestResetPasswordDto
{
    public string Email { get; set; }
}

// VerifyResetOtpDto.cs
public class VerifyResetOtpDto
{
    public string Email { get; set; }
    public string Otp { get; set; }
}

// ResetPasswordDto.cs
public class ResetPasswordDto
{
    public string Email { get; set; }
    public string Otp { get; set; }
    public string NewPassword { get; set; }
}