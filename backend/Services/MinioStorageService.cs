using Minio;
using Minio.DataModel.Args;
using Minio.DataModel;
using Minio.Exceptions;
using System.Reactive.Linq;
using Microsoft.AspNetCore.Http;

namespace backend.Services;

public class MinioStorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly ILogger<MinioStorageService> _logger;
    private readonly IConfiguration _configuration;
    private readonly string _bucketName;

    public MinioStorageService(IConfiguration configuration, ILogger<MinioStorageService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        
        var endpoint = configuration["MinIO:Endpoint"] ?? "localhost:9000";
        var accessKey = configuration["MinIO:AccessKey"] ?? "admin";
        var secretKey = configuration["MinIO:SecretKey"] ?? "password123";
        var useSSL = configuration.GetValue<bool>("MinIO:UseSSL", false);
        _bucketName = configuration["MinIO:BucketName"] ?? "media-library";

        _minioClient = new MinioClient()
            .WithEndpoint(endpoint)
            .WithCredentials(accessKey, secretKey)
            .WithSSL(useSSL)
            .Build();

        _logger.LogInformation("MinIO Storage Service initialized with endpoint: {Endpoint}, bucket: {Bucket}", 
            endpoint, _bucketName);

        // Ensure bucket exists
        Task.Run(async () => await EnsureBucketExistsAsync());
    }

    private async Task EnsureBucketExistsAsync()
    {
        try
        {
            var bucketExistsArgs = new BucketExistsArgs().WithBucket(_bucketName);
            bool found = await _minioClient.BucketExistsAsync(bucketExistsArgs);
            
            if (!found)
            {
                var makeBucketArgs = new MakeBucketArgs().WithBucket(_bucketName);
                await _minioClient.MakeBucketAsync(makeBucketArgs);
                _logger.LogInformation("Created MinIO bucket: {BucketName}", _bucketName);
            }
            else
            {
                _logger.LogInformation("MinIO bucket already exists: {BucketName}", _bucketName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error ensuring MinIO bucket exists");
        }
    }

    public async Task<string> SaveFileAsync(IFormFile file, string? subDirectory = null)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is null or empty", nameof(file));
        }

        using var stream = file.OpenReadStream();
        var fileName = subDirectory != null 
            ? $"{subDirectory}/{file.FileName}"
            : file.FileName;
        
        return await SaveFileAsync(stream, fileName, file.ContentType);
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType = "application/octet-stream")
    {
        try
        {
            // Generate unique file name to avoid collisions
            var uniqueFileName = $"{Guid.NewGuid()}/{fileName}";
            
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(uniqueFileName)
                .WithStreamData(fileStream)
                .WithObjectSize(fileStream.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs);
            
            _logger.LogInformation("File uploaded to MinIO: {FileName}", uniqueFileName);
            
            // Return the path that can be used to retrieve the file
            return uniqueFileName;
        }
        catch (MinioException ex)
        {
            _logger.LogError(ex, "MinIO error while uploading file: {FileName}", fileName);
            throw new InvalidOperationException($"Failed to upload file to MinIO: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while uploading file: {FileName}", fileName);
            throw;
        }
    }

    public async Task<Stream> GetFileAsync(string filePath)
    {
        try
        {
            var memoryStream = new MemoryStream();
            
            var getObjectArgs = new GetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(filePath)
                .WithCallbackStream((stream) =>
                {
                    stream.CopyTo(memoryStream);
                });

            await _minioClient.GetObjectAsync(getObjectArgs);
            memoryStream.Position = 0;
            
            _logger.LogInformation("File retrieved from MinIO: {FilePath}", filePath);
            return memoryStream;
        }
        catch (ObjectNotFoundException)
        {
            _logger.LogWarning("File not found in MinIO: {FilePath}", filePath);
            throw new FileNotFoundException($"File not found: {filePath}");
        }
        catch (MinioException ex)
        {
            _logger.LogError(ex, "MinIO error while retrieving file: {FilePath}", filePath);
            throw new InvalidOperationException($"Failed to retrieve file from MinIO: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while retrieving file: {FilePath}", filePath);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        try
        {
            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(filePath);

            await _minioClient.RemoveObjectAsync(removeObjectArgs);
            
            _logger.LogInformation("File deleted from MinIO: {FilePath}", filePath);
            return true;
        }
        catch (ObjectNotFoundException)
        {
            _logger.LogWarning("File not found for deletion in MinIO: {FilePath}", filePath);
            return false;
        }
        catch (MinioException ex)
        {
            _logger.LogError(ex, "MinIO error while deleting file: {FilePath}", filePath);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while deleting file: {FilePath}", filePath);
            return false;
        }
    }

    public async Task<bool> FileExistsAsync(string filePath)
    {
        try
        {
            var statObjectArgs = new StatObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(filePath);

            await _minioClient.StatObjectAsync(statObjectArgs);
            return true;
        }
        catch (ObjectNotFoundException)
        {
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking file existence: {FilePath}", filePath);
            return false;
        }
    }

    public async Task<string> GetPresignedUrlAsync(string filePath, int expiryInSeconds = 3600)
    {
        try
        {
            var presignedGetObjectArgs = new PresignedGetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(filePath)
                .WithExpiry(expiryInSeconds);

            string url = await _minioClient.PresignedGetObjectAsync(presignedGetObjectArgs);
            
            _logger.LogDebug("Generated presigned URL for file: {FilePath}", filePath);
            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating presigned URL for file: {FilePath}", filePath);
            throw;
        }
    }

    public async Task<IEnumerable<string>> ListFilesAsync(string prefix = "")
    {
        try
        {
            var files = new List<string>();
            var listObjectsArgs = new ListObjectsArgs()
                .WithBucket(_bucketName)
                .WithPrefix(prefix)
                .WithRecursive(true);

            var observable = _minioClient.ListObjectsEnumAsync(listObjectsArgs);
            
            await foreach (var item in observable)
            {
                files.Add(item.Key);
            }

            _logger.LogInformation("Listed {Count} files with prefix: {Prefix}", files.Count, prefix);
            return files;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing files with prefix: {Prefix}", prefix);
            throw;
        }
    }

    public async Task<bool> CopyFileAsync(string sourcePath, string destinationPath)
    {
        try
        {
            var copySourceArgs = new CopySourceObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(sourcePath);
            
            var copyObjectArgs = new CopyObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(destinationPath)
                .WithCopyObjectSource(copySourceArgs);

            await _minioClient.CopyObjectAsync(copyObjectArgs);
            
            _logger.LogInformation("File copied from {Source} to {Destination}", sourcePath, destinationPath);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error copying file from {Source} to {Destination}", sourcePath, destinationPath);
            return false;
        }
    }

    public async Task<long> GetFileSizeAsync(string filePath)
    {
        try
        {
            var statObjectArgs = new StatObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(filePath);

            var stat = await _minioClient.StatObjectAsync(statObjectArgs);
            return stat.Size;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting file size: {FilePath}", filePath);
            return -1;
        }
    }
}