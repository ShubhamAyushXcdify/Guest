namespace Api.Services
{
    /// <summary>
    /// Service for saving uploaded files to the configured uploads folder.
    /// </summary>
    public interface IFileUploadService
    {
        /// <summary>
        /// Saves the file to the uploads folder and returns the path to store in the database: folder name + file name (e.g. uploads\filename.png).
        /// The folder name is the name of the directory where files are stored (e.g. "uploads"); if the folder name changes, this value changes accordingly.
        /// </summary>
        /// <param name="file">The uploaded file.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The path as folder\filename (or folder/filename), or null if file is null/empty.</returns>
        Task<string?> SaveFileAsync(IFormFile? file, CancellationToken cancellationToken = default);

        /// <summary>
        /// Deletes a file by path stored in DB (folder\filename or filename).
        /// </summary>
        bool TryDeleteFile(string? storedPath);
    }
}
