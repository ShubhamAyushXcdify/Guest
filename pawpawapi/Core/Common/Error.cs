namespace Core.Common
{
    public class Error
    {
        public string Message { get; set; } = string.Empty;
        public ErrorType Type { get; set; }

        public static Error Validation(string message) =>
            new Error { Message = message, Type = ErrorType.Validation };
    }
}
