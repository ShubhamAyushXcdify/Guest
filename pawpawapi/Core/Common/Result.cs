namespace Core.Common
{
    public class Result<T>
    {
        public bool IsSuccess => Error == null;
        public T? Value { get; private set; }
        public Error? Error { get; private set; }

        private Result() { }

        public static Result<T> Success(T value) =>
            new Result<T>
            {
                Value = value,
                Error = null
            };

        public static Result<T> Failure(string message, ErrorType type) =>
            new Result<T>
            {
                Value = default,
                Error = new Error { Message = message, Type = type }
            };

        public static Result<T> Failure(Error error) =>
            new Result<T>
            {
                Value = default,
                Error = error ?? new Error { Message = "Unknown error", Type = ErrorType.Internal }
            };
    }
}
