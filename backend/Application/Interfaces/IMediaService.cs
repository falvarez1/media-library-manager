using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Domain.Common;
using backend.Models;
using backend.Models.Dto;
using Microsoft.AspNetCore.Http;

namespace backend.Application.Interfaces;

public interface IMediaService
{
    // Query operations
    Task<PaginatedResponse<MediaItem>> SearchAsync(MediaSearchRequest request);
    Task<ApiResponse<MediaItem>> GetByIdAsync(Guid id);
    Task<ApiResponse<MediaStatistics>> GetStatisticsAsync(StatisticsQuery? query = null);
    Task<ApiResponse<MediaUrlResponse>> GetMediaUrlAsync(Guid id);
    
    // CRUD operations
    Task<ApiResponse<MediaItem>> CreateAsync(CreateMediaItemDto dto, IFormFile file);
    Task<ApiResponse<MediaItem>> UpdateAsync(Guid id, UpdateMediaItemDto dto);
    Task<ApiResponse<bool>> DeleteAsync(Guid id);
    
    // Batch operations
    Task<ApiResponse<BatchOperationResult>> BatchMoveAsync(BatchMoveRequest request);
    Task<ApiResponse<BatchOperationResult>> BatchCopyAsync(BatchCopyRequest request);
    Task<ApiResponse<BatchOperationResult>> BatchDeleteAsync(BatchDeleteRequest request);
    Task<ApiResponse<BatchOperationResult>> BatchTagAsync(BatchTagRequest request);
    Task<ApiResponse<BatchOperationResult>> BatchUpdateAsync(Guid[] ids, UpdateMediaItemDto updates);
    
    // Special operations
    Task<ApiResponse<MediaItem>> ToggleStarAsync(Guid id);
    Task<ApiResponse<MediaItem>> ToggleFavoriteAsync(Guid id);
    Task<ApiResponse<bool>> ValidateMediaAsync(Guid id);
    Task<ApiResponse<MediaMetadata>> ExtractMetadataAsync(Guid id);
}

// Additional DTOs for service operations
public class MediaStatistics
{
    public int TotalCount { get; set; }
    public long TotalSize { get; set; }
    public Dictionary<string, int> CountByType { get; set; } = new();
    public Dictionary<string, long> SizeByType { get; set; } = new();
    public int UsedCount { get; set; }
    public int UnusedCount { get; set; }
    public int StarredCount { get; set; }
    public int FavoritedCount { get; set; }
    public Dictionary<string, int> CountByStatus { get; set; } = new();
    public MediaItem? LatestUpload { get; set; }
    public MediaItem? MostViewed { get; set; }
    public List<MediaUsageTrend>? UsageTrends { get; set; }
}

public class MediaUsageTrend
{
    public DateTime Date { get; set; }
    public int Uploads { get; set; }
    public int Downloads { get; set; }
    public int Views { get; set; }
    public long StorageUsed { get; set; }
}

public class StatisticsQuery
{
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? GroupBy { get; set; } // "day", "week", "month"
    public bool IncludeTrends { get; set; }
    public bool IncludeTopItems { get; set; }
}

public class MediaMetadata
{
    public Dictionary<string, object> FileInfo { get; set; } = new();
    public Dictionary<string, object>? ImageInfo { get; set; }
    public Dictionary<string, object>? VideoInfo { get; set; }
    public Dictionary<string, object>? AudioInfo { get; set; }
    public List<string>? ExtractedTags { get; set; }
    public string? ThumbnailUrl { get; set; }
}