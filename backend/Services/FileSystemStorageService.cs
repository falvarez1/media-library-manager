using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting; // Required for IWebHostEnvironment
using System.IO; // Required for Path operations
using System.Threading.Tasks; // Required for Task

namespace backend.Services;

public class FileSystemStorageService : IFileStorageService
{
    private readonly string _storagePath;
    private readonly ILogger<FileSystemStorageService> _logger;

    public FileSystemStorageService(IWebHostEnvironment env, IConfiguration config, ILogger<FileSystemStorageService> logger)
    {
        _logger = logger; // Initialize logger first
        
        // Get base storage path from configuration or default to a 'uploads' folder in wwwroot
        // Ensure wwwroot exists if using it as a base.
        var configuredPath = config.GetValue<string>("Storage:FileSystem:BasePath");
        if (string.IsNullOrWhiteSpace(configuredPath))
        {
            // Use ContentRootPath as a fallback if WebRootPath is null (e.g., in non-web scenarios or certain configurations)
            var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
            _storagePath = Path.Combine(webRoot, "uploads");
            // Ensure wwwroot exists if we intend to use it
            if (!Directory.Exists(webRoot)) Directory.CreateDirectory(webRoot);

            _logger.LogWarning("Storage:FileSystem:BasePath not configured. Defaulting to: {DefaultPath}", _storagePath);
        }
        else
        {
            // Resolve relative paths based on ContentRootPath
            _storagePath = Path.IsPathRooted(configuredPath)
                ? configuredPath
                : Path.GetFullPath(Path.Combine(env.ContentRootPath, configuredPath));
        }

        _logger.LogInformation("File System Storage Path configured to: {StoragePath}", _storagePath);

        // Ensure the base storage directory exists
        if (!Directory.Exists(_storagePath))
        {
            try
            {
                Directory.CreateDirectory(_storagePath);
                _logger.LogInformation("Created base storage directory: {StoragePath}", _storagePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create base storage directory: {StoragePath}", _storagePath);
                // Depending on requirements, you might want to throw here to prevent startup
            }
        }
    }

    public async Task<string> SaveFileAsync(IFormFile file, string? subDirectory = null)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File cannot be null or empty.", nameof(file));
        }

        // Combine base path with optional subdirectory
        var targetDirectory = string.IsNullOrWhiteSpace(subDirectory)
            ? _storagePath
            : Path.Combine(_storagePath, subDirectory);

        // Ensure the target subdirectory exists
        if (!Directory.Exists(targetDirectory))
        {
             try
            {
                Directory.CreateDirectory(targetDirectory);
                _logger.LogInformation("Created target storage subdirectory: {SubDirectory}", targetDirectory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create target storage subdirectory: {SubDirectory}", targetDirectory);
                throw; // Re-throw as we cannot save the file
            }
        }

        // Generate a unique filename to avoid collisions (e.g., GUID + original extension)
        // Sanitize original filename before getting extension to prevent path traversal issues
        var originalFileName = Path.GetFileName(file.FileName);
        var fileExtension = Path.GetExtension(originalFileName);
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

        // Ensure subdirectory part of relative path is safe (replace invalid chars)
        var safeSubDirectory = string.IsNullOrWhiteSpace(subDirectory)
            ? string.Empty
            : string.Join("_", subDirectory.Split(Path.GetInvalidPathChars()));

        var relativePath = string.IsNullOrWhiteSpace(safeSubDirectory)
            ? uniqueFileName
            : Path.Combine(safeSubDirectory, uniqueFileName); // Relative path for DB storage

        var fullPath = Path.Combine(targetDirectory, uniqueFileName); // Full physical path

        _logger.LogInformation("Attempting to save file '{OriginalName}' as '{FullPath}'", originalFileName, fullPath);

        try
        {
            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            _logger.LogInformation("Successfully saved file to '{FullPath}'", fullPath);
            return relativePath; // Return the relative path for storing in the database
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving file '{OriginalName}' to '{FullPath}'", originalFileName, fullPath);
            // Consider cleanup: delete partially written file if necessary
            if (File.Exists(fullPath))
            {
                try { File.Delete(fullPath); } catch { /* Ignore delete error */ }
            }
            throw; // Re-throw the exception
        }
    }

    public Task<bool> DeleteFileAsync(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            _logger.LogWarning("DeleteFileAsync called with empty or null path.");
            return Task.FromResult(true); // Consider empty path as "nothing to delete" -> success
        }

        // Combine base path with the relative path stored in DB
        // Normalize the relative path to prevent directory traversal issues
        var safeRelativePath = Path.GetFullPath(Path.Combine(_storagePath, relativePath));

        // Security check: Ensure the resolved path is still within the intended storage directory
        if (!safeRelativePath.StartsWith(_storagePath))
        {
             _logger.LogError("Attempted to delete file outside the storage directory: '{RelativePath}' resolved to '{FullPath}'", relativePath, safeRelativePath);
             return Task.FromResult(false); // Indicate failure due to security concern
        }

        var fullPath = safeRelativePath; // Use the validated full path

        _logger.LogInformation("Attempting to delete file '{FullPath}'", fullPath);

        try
        {
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("Successfully deleted file '{FullPath}'", fullPath);
                return Task.FromResult(true);
            }
            else
            {
                _logger.LogWarning("File not found for deletion: '{FullPath}'", fullPath);
                return Task.FromResult(true); // File doesn't exist, consider deletion successful
            }
        }
        catch (IOException ex) // Catch specific IO errors
        {
            _logger.LogError(ex, "IO error deleting file '{FullPath}'", fullPath);
            return Task.FromResult(false); // Indicate failure
        }
        catch (UnauthorizedAccessException ex) // Catch permission errors
        {
             _logger.LogError(ex, "Unauthorized access deleting file '{FullPath}'", fullPath);
            return Task.FromResult(false); // Indicate failure
        }
        catch (Exception ex) // Catch unexpected errors
        {
            _logger.LogError(ex, "Unexpected error deleting file '{FullPath}'", fullPath);
            return Task.FromResult(false); // Indicate failure
        }
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType = "application/octet-stream")
    {
        if (fileStream == null || fileStream.Length == 0)
        {
            throw new ArgumentException("File stream cannot be null or empty.", nameof(fileStream));
        }

        var fileExtension = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        var fullPath = Path.Combine(_storagePath, uniqueFileName);

        try
        {
            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await fileStream.CopyToAsync(stream);
            }
            _logger.LogInformation("Successfully saved stream to '{FullPath}'", fullPath);
            return uniqueFileName;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving stream to '{FullPath}'", fullPath);
            if (File.Exists(fullPath))
            {
                try { File.Delete(fullPath); } catch { }
            }
            throw;
        }
    }

    public Task<Stream> GetFileAsync(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath))
        {
            throw new ArgumentException("File path cannot be null or empty.", nameof(filePath));
        }

        var fullPath = Path.GetFullPath(Path.Combine(_storagePath, filePath));
        
        if (!fullPath.StartsWith(_storagePath))
        {
            throw new InvalidOperationException("Invalid file path");
        }

        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException($"File not found: {filePath}");
        }

        return Task.FromResult<Stream>(new FileStream(fullPath, FileMode.Open, FileAccess.Read));
    }

    public Task<bool> FileExistsAsync(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath))
        {
            return Task.FromResult(false);
        }

        var fullPath = Path.GetFullPath(Path.Combine(_storagePath, filePath));
        
        if (!fullPath.StartsWith(_storagePath))
        {
            return Task.FromResult(false);
        }

        return Task.FromResult(File.Exists(fullPath));
    }

    public Task<string> GetPresignedUrlAsync(string filePath, int expiryInSeconds = 3600)
    {
        // For file system storage, return a relative URL that the app can serve
        // In production, this would typically be served through a static file handler
        return Task.FromResult($"/uploads/{filePath}");
    }

    public Task<IEnumerable<string>> ListFilesAsync(string prefix = "")
    {
        var searchPath = string.IsNullOrWhiteSpace(prefix) 
            ? _storagePath 
            : Path.Combine(_storagePath, prefix);

        if (!Directory.Exists(searchPath))
        {
            return Task.FromResult(Enumerable.Empty<string>());
        }

        var files = Directory.GetFiles(searchPath, "*", SearchOption.AllDirectories)
            .Select(f => Path.GetRelativePath(_storagePath, f).Replace('\\', '/'))
            .ToList();

        return Task.FromResult<IEnumerable<string>>(files);
    }

    public async Task<bool> CopyFileAsync(string sourcePath, string destinationPath)
    {
        try
        {
            var sourceFullPath = Path.GetFullPath(Path.Combine(_storagePath, sourcePath));
            var destFullPath = Path.GetFullPath(Path.Combine(_storagePath, destinationPath));

            if (!sourceFullPath.StartsWith(_storagePath) || !destFullPath.StartsWith(_storagePath))
            {
                _logger.LogError("Attempted to copy files outside storage directory");
                return false;
            }

            if (!File.Exists(sourceFullPath))
            {
                _logger.LogWarning("Source file not found: {SourcePath}", sourcePath);
                return false;
            }

            var destDir = Path.GetDirectoryName(destFullPath);
            if (!string.IsNullOrEmpty(destDir) && !Directory.Exists(destDir))
            {
                Directory.CreateDirectory(destDir);
            }

            await Task.Run(() => File.Copy(sourceFullPath, destFullPath, true));
            _logger.LogInformation("Successfully copied file from '{Source}' to '{Dest}'", sourcePath, destinationPath);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error copying file from '{Source}' to '{Dest}'", sourcePath, destinationPath);
            return false;
        }
    }

    public Task<long> GetFileSizeAsync(string filePath)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(filePath))
            {
                return Task.FromResult(-1L);
            }

            var fullPath = Path.GetFullPath(Path.Combine(_storagePath, filePath));
            
            if (!fullPath.StartsWith(_storagePath))
            {
                _logger.LogError("Attempted to access file outside storage directory: {FilePath}", filePath);
                return Task.FromResult(-1L);
            }

            if (!File.Exists(fullPath))
            {
                _logger.LogWarning("File not found for size check: {FilePath}", filePath);
                return Task.FromResult(-1L);
            }

            var fileInfo = new FileInfo(fullPath);
            return Task.FromResult(fileInfo.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting file size for '{FilePath}'", filePath);
            return Task.FromResult(-1L);
        }
    }
}