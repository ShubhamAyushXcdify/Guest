namespace Application.Interfaces
{
    /// <summary>
    /// Resolves the stored file name (e.g. from logo_url) to the full URL where the file can be accessed.
    /// </summary>
    public interface IUploadedFileUrlResolver
    {
        /// <summary>
        /// Returns the full URL for an uploaded file, or null if storedFileName is null/empty.
        /// </summary>
        string? GetFileUrl(string? storedFileName);
    }
}
