namespace backend.Services;

public interface IFileStorageService
{
    /// <summary>
    /// Saves the uploaded file to the configured storage location.
    /// </summary>
    /// <param name="file">The uploaded file.</param>
    /// <param name="subDirectory">Optional subdirectory within the main storage path (e.g., "images", "documents").</param>
    /// <returns>The relative physical path where the file was saved.</returns>
    Task<string> SaveFileAsync(IFormFile file, string? subDirectory = null);

    /// <summary>
    /// Saves a file stream to the configured storage location.
    /// </summary>
    /// <param name="fileStream">The file stream to save.</param>
    /// <param name="fileName">The name of the file.</param>
    /// <param name="contentType">The content type of the file.</param>
    /// <returns>The relative path where the file was saved.</returns>
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType = "application/octet-stream");

    /// <summary>
    /// Retrieves a file from storage as a stream.
    /// </summary>
    /// <param name="filePath">The relative path of the file.</param>
    /// <returns>A stream containing the file data.</returns>
    Task<Stream> GetFileAsync(string filePath);

    /// <summary>
    /// Deletes the specified file from the storage location.
    /// </summary>
    /// <param name="relativePath">The relative path of the file to delete (as stored in the database).</param>
    /// <returns>True if deletion was successful or file didn't exist, false otherwise.</returns>
    Task<bool> DeleteFileAsync(string relativePath);

    /// <summary>
    /// Checks if a file exists in storage.
    /// </summary>
    /// <param name="filePath">The relative path of the file.</param>
    /// <returns>True if the file exists, false otherwise.</returns>
    Task<bool> FileExistsAsync(string filePath);

    /// <summary>
    /// Gets a presigned URL for direct access to the file.
    /// </summary>
    /// <param name="filePath">The relative path of the file.</param>
    /// <param name="expiryInSeconds">URL expiry time in seconds.</param>
    /// <returns>A presigned URL for the file.</returns>
    Task<string> GetPresignedUrlAsync(string filePath, int expiryInSeconds = 3600);

    /// <summary>
    /// Lists all files with the given prefix.
    /// </summary>
    /// <param name="prefix">The prefix to filter files.</param>
    /// <returns>A list of file paths.</returns>
    Task<IEnumerable<string>> ListFilesAsync(string prefix = "");

    /// <summary>
    /// Copies a file from one location to another.
    /// </summary>
    /// <param name="sourcePath">The source file path.</param>
    /// <param name="destinationPath">The destination file path.</param>
    /// <returns>True if the copy was successful, false otherwise.</returns>
    Task<bool> CopyFileAsync(string sourcePath, string destinationPath);

    /// <summary>
    /// Gets the size of a file in bytes.
    /// </summary>
    /// <param name="filePath">The relative path of the file.</param>
    /// <returns>The file size in bytes, or -1 if error.</returns>
    Task<long> GetFileSizeAsync(string filePath);
}