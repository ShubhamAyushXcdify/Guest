using Application.Interfaces;

namespace Api.Services
{
    /// <summary>
    /// Resolves stored file names to full URLs using the current request's scheme and host (e.g. https://localhost:9999/Uploads/filename.png).
    /// </summary>
    public class UploadedFileUrlResolver : IUploadedFileUrlResolver
    {
        private const string UploadsPath = "/Uploads/";
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UploadedFileUrlResolver(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? GetFileUrl(string? storedFileName)
        {
            if (string.IsNullOrWhiteSpace(storedFileName))
                return null;

            var context = _httpContextAccessor.HttpContext;
            if (context?.Request != null)
            {
                var scheme = context.Request.Scheme;
                var host = context.Request.Host.Value;
                return $"{scheme}://{host}{UploadsPath}{storedFileName.Trim()}";
            }

            // Fallback when no HttpContext (e.g. background job): return relative path
            return UploadsPath + storedFileName.Trim();
        }
    }
}
