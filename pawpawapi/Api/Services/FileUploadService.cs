using Microsoft.Extensions.Hosting;

namespace Api.Services
{
    /// <summary>
    /// Saves uploaded files to the path configured in appsettings (FileUpload:UploadPath) under an "uploads" folder.
    /// </summary>
    public class FileUploadService : IFileUploadService
    {
        private readonly string _uploadsDirectory;
        private readonly ILogger<FileUploadService> _logger;

        public FileUploadService(IConfiguration configuration, IWebHostEnvironment environment, ILogger<FileUploadService> logger)
        {
            _logger = logger;
            var basePath = configuration["FileUpload:UploadPath"];
            if (string.IsNullOrWhiteSpace(basePath))
            {
                basePath = environment.ContentRootPath;
            }

            _uploadsDirectory = Path.Combine(basePath, "uploads");
            if (!Directory.Exists(_uploadsDirectory))
            {
                Directory.CreateDirectory(_uploadsDirectory);
                _logger.LogInformation("Created uploads directory at {Path}", _uploadsDirectory);
            }
        }

        /// <inheritdoc />
        public async Task<string?> SaveFileAsync(IFormFile? file, CancellationToken cancellationToken = default)
        {
            if (file == null || file.Length == 0)
                return null;

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrEmpty(extension))
                extension = ".bin";

            var fileName = $"{Guid.NewGuid():N}{extension}";
            var fullPath = Path.Combine(_uploadsDirectory, fileName);

            await using (var stream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            var folderName = Path.GetFileName(_uploadsDirectory.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));
            var pathToStore = Path.Combine(folderName, fileName);

            _logger.LogDebug("Saved upload at {FullPath}, storing as {PathToStore}", fullPath, pathToStore);
            return pathToStore;
        }

        /// <inheritdoc />
        public bool TryDeleteFile(string? storedPath)
        {
            if (string.IsNullOrWhiteSpace(storedPath))
                return false;

            var fileName = Path.GetFileName(storedPath);
            if (string.IsNullOrEmpty(fileName))
                return false;

            var fullPath = Path.Combine(_uploadsDirectory, fileName);

            if (!File.Exists(fullPath))
                return false;

            try
            {
                File.Delete(fullPath);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not delete file {Path}", fullPath);
                return false;
            }
        }
    }
}
