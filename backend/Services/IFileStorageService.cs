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
    /// Deletes the specified file from the storage location.
    /// </summary>
    /// <param name="relativePath">The relative path of the file to delete (as stored in the database).</param>
    /// <returns>True if deletion was successful or file didn't exist, false otherwise.</returns>
    Task<bool> DeleteFileAsync(string relativePath);
}