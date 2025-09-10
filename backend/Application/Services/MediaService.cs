using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using backend.Application.Interfaces;
using backend.Data;
using backend.Domain.Common;
using backend.Domain.Interfaces;
using backend.Models;
using backend.Models.Dto;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Application.Services;

public class MediaService : IMediaService
{
    private readonly AppDbContext _dbContext;
    private readonly IFileStorageService _storageService;
    private readonly ILogger<MediaService> _logger;
    
    public MediaService(
        AppDbContext dbContext,
        IFileStorageService storageService,
        ILogger<MediaService> logger)
    {
        _dbContext = dbContext;
        _storageService = storageService;
        _logger = logger;
    }
    
    public async Task<PaginatedResponse<MediaItem>> SearchAsync(MediaSearchRequest request)
    {
        try
        {
            var query = _dbContext.MediaItems.AsQueryable();
            
            // Apply filters
            if (!string.IsNullOrWhiteSpace(request.Query))
            {
                query = query.Where(m => m.Name.Contains(request.Query) || 
                                         (m.Path != null && m.Path.Contains(request.Query)));
            }
            
            if (request.Types?.Length > 0)
            {
                query = query.Where(m => request.Types.Contains(m.Type));
            }
            
            if (request.FolderId.HasValue)
            {
                if (request.IncludeSubfolders ?? false)
                {
                    // Get all descendant folder IDs
                    var folderIds = await GetDescendantFolderIds(request.FolderId.Value);
                    folderIds.Add(request.FolderId.Value);
                    query = query.Where(m => m.FolderId.HasValue && folderIds.Contains(m.FolderId.Value));
                }
                else
                {
                    query = query.Where(m => m.FolderId == request.FolderId.Value);
                }
            }
            
            if (request.Tags?.Length > 0)
            {
                // TODO: This needs to be fixed when we implement proper many-to-many tags
                foreach (var tag in request.Tags)
                {
                    query = query.Where(m => m.Tags != null && m.Tags.Contains($"\"{tag}\""));
                }
            }
            
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                query = query.Where(m => m.Status == request.Status);
            }
            
            if (request.DateFrom.HasValue)
            {
                query = query.Where(m => m.CreatedAt >= request.DateFrom.Value);
            }
            
            if (request.DateTo.HasValue)
            {
                query = query.Where(m => m.CreatedAt <= request.DateTo.Value);
            }
            
            if (request.IsStarred.HasValue)
            {
                query = query.Where(m => m.IsStarred == request.IsStarred.Value);
            }
            
            if (request.IsFavorited.HasValue)
            {
                query = query.Where(m => m.IsFavorited == request.IsFavorited.Value);
            }
            
            if (request.IsUsed.HasValue)
            {
                query = query.Where(m => m.IsUsed == request.IsUsed.Value);
            }
            
            // Get total count before pagination
            var totalCount = await query.CountAsync();
            
            // Apply sorting
            query = ApplySorting(query, request.SortBy, request.SortOrder);
            
            // Apply pagination
            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();
            
            // Generate facets if requested
            Dictionary<string, List<FacetValue>>? facets = null;
            if (request.IncludeFacets ?? false)
            {
                facets = await GenerateFacets(query);
            }
            
            return PaginatedResponse<MediaItem>.CreatePaginated(
                items, 
                request.Page, 
                request.PageSize, 
                totalCount,
                facets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching media items");
            throw;
        }
    }
    
    public async Task<ApiResponse<MediaItem>> GetByIdAsync(Guid id)
    {
        var item = await _dbContext.MediaItems
            .Include(m => m.Folder)
            .FirstOrDefaultAsync(m => m.Id == id);
            
        if (item == null)
        {
            return ApiResponse<MediaItem>.Fail("NOT_FOUND", $"Media item with ID {id} not found", 404);
        }
        
        return ApiResponse<MediaItem>.Ok(item);
    }
    
    public async Task<ApiResponse<MediaItem>> CreateAsync(CreateMediaItemDto dto, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return ApiResponse<MediaItem>.Fail("INVALID_FILE", "File is required", 400);
        }
        
        string relativePath;
        try
        {
            string subDirectory = dto.Type?.ToLowerInvariant() ?? "other";
            relativePath = await _storageService.SaveFileAsync(file, subDirectory);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save uploaded file '{FileName}'", file.FileName);
            return ApiResponse<MediaItem>.Fail("STORAGE_ERROR", "Failed to save file", 500);
        }
        
        var newItem = new MediaItem
        {
            Id = Guid.NewGuid(),
            Type = dto.Type,
            Name = file.FileName,
            FolderId = dto.FolderId,
            Path = dto.Path,
            PhysicalPath = relativePath,
            SizeInBytes = file.Length,
            CreatedAt = DateTimeOffset.UtcNow,
            ModifiedAt = DateTimeOffset.UtcNow,
            IsUsed = false,
            UsedIn = dto.UsedIn != null ? JsonSerializer.Serialize(dto.UsedIn) : null,
            Tags = dto.Tags != null ? JsonSerializer.Serialize(dto.Tags) : null,
            IsStarred = dto.IsStarred,
            IsFavorited = dto.IsFavorited,
            Status = dto.Status ?? "in_review"
        };
        
        try
        {
            _dbContext.MediaItems.Add(newItem);
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Created new MediaItem with ID: {MediaItemId}", newItem.Id);
            return ApiResponse<MediaItem>.Ok(newItem, "Media item created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save new MediaItem to database");
            
            // Attempt to delete the orphaned file
            try
            {
                await _storageService.DeleteFileAsync(relativePath);
            }
            catch (Exception deleteEx)
            {
                _logger.LogError(deleteEx, "Failed to delete orphaned file '{PhysicalPath}'", relativePath);
            }
            
            return ApiResponse<MediaItem>.Fail("DATABASE_ERROR", "Failed to save media information", 500);
        }
    }
    
    public async Task<ApiResponse<MediaItem>> UpdateAsync(Guid id, UpdateMediaItemDto dto)
    {
        var existingItem = await _dbContext.MediaItems.FindAsync(id);
        
        if (existingItem == null)
        {
            return ApiResponse<MediaItem>.Fail("NOT_FOUND", $"Media item with ID {id} not found", 404);
        }
        
        // Update properties only if they are provided
        if (dto.Name != null) existingItem.Name = dto.Name;
        if (dto.FolderId.HasValue) existingItem.FolderId = dto.FolderId.Value == Guid.Empty ? null : dto.FolderId;
        if (dto.Path != null) existingItem.Path = dto.Path;
        if (dto.IsUsed.HasValue) existingItem.IsUsed = dto.IsUsed.Value;
        if (dto.UsedIn != null) existingItem.UsedIn = JsonSerializer.Serialize(dto.UsedIn);
        if (dto.Tags != null) existingItem.Tags = JsonSerializer.Serialize(dto.Tags);
        if (dto.IsStarred.HasValue) existingItem.IsStarred = dto.IsStarred.Value;
        if (dto.IsFavorited.HasValue) existingItem.IsFavorited = dto.IsFavorited.Value;
        if (dto.Status != null) existingItem.Status = dto.Status;
        if (dto.Attribution != null) existingItem.Attribution = dto.Attribution;
        if (dto.Metadata != null) existingItem.Metadata = dto.Metadata;
        if (dto.RejectionReason != null) existingItem.RejectionReason = dto.RejectionReason;
        
        existingItem.ModifiedAt = DateTimeOffset.UtcNow;
        
        try
        {
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Updated MediaItem with ID: {MediaItemId}", id);
            return ApiResponse<MediaItem>.Ok(existingItem, "Media item updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update MediaItem ID {MediaItemId}", id);
            return ApiResponse<MediaItem>.Fail("UPDATE_ERROR", "Failed to update media item", 500);
        }
    }
    
    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var existingItem = await _dbContext.MediaItems.FindAsync(id);
        
        if (existingItem == null)
        {
            // Item doesn't exist, consider the delete successful (idempotent)
            return ApiResponse<bool>.Ok(true, "Media item already deleted or doesn't exist");
        }
        
        // Attempt to delete physical file
        if (!string.IsNullOrWhiteSpace(existingItem.PhysicalPath))
        {
            try
            {
                await _storageService.DeleteFileAsync(existingItem.PhysicalPath);
                _logger.LogInformation("Deleted physical file for MediaItem ID {MediaItemId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete physical file for MediaItem ID {MediaItemId}", id);
            }
        }
        
        try
        {
            _dbContext.MediaItems.Remove(existingItem);
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Deleted MediaItem with ID: {MediaItemId}", id);
            return ApiResponse<bool>.Ok(true, "Media item deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete MediaItem ID {MediaItemId}", id);
            return ApiResponse<bool>.Fail("DELETE_ERROR", "Failed to delete media item", 500);
        }
    }
    
    public async Task<ApiResponse<BatchOperationResult>> BatchMoveAsync(BatchMoveRequest request)
    {
        var targetFolder = await _dbContext.Folders.FindAsync(request.TargetFolderId);
        if (targetFolder == null)
        {
            return ApiResponse<BatchOperationResult>.Fail("INVALID_FOLDER", "Target folder not found", 400);
        }
        
        var result = new BatchOperationResult
        {
            TotalRequested = request.MediaIds.Length
        };
        
        var errors = new List<string>();
        var processedIds = new List<Guid>();
        
        foreach (var mediaId in request.MediaIds)
        {
            try
            {
                var mediaItem = await _dbContext.MediaItems.FindAsync(mediaId);
                if (mediaItem != null)
                {
                    mediaItem.FolderId = request.TargetFolderId;
                    mediaItem.ModifiedAt = DateTimeOffset.UtcNow;
                    processedIds.Add(mediaId);
                    result.SuccessCount++;
                }
                else
                {
                    errors.Add($"Media item {mediaId} not found");
                    result.FailureCount++;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error moving media item {MediaId}", mediaId);
                errors.Add($"Failed to move item {mediaId}");
                result.FailureCount++;
            }
        }
        
        await _dbContext.SaveChangesAsync();
        
        result.Errors = errors.ToArray();
        result.ProcessedIds = processedIds.ToArray();
        
        return ApiResponse<BatchOperationResult>.Ok(result, 
            $"Moved {result.SuccessCount} of {result.TotalRequested} items");
    }
    
    public async Task<ApiResponse<BatchOperationResult>> BatchDeleteAsync(BatchDeleteRequest request)
    {
        var result = new BatchOperationResult
        {
            TotalRequested = request.MediaIds.Length
        };
        
        var errors = new List<string>();
        var processedIds = new List<Guid>();
        
        foreach (var mediaId in request.MediaIds)
        {
            try
            {
                var mediaItem = await _dbContext.MediaItems.FindAsync(mediaId);
                if (mediaItem != null)
                {
                    // Delete physical file
                    if (!string.IsNullOrWhiteSpace(mediaItem.PhysicalPath))
                    {
                        try
                        {
                            await _storageService.DeleteFileAsync(mediaItem.PhysicalPath);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to delete physical file for media item {MediaId}", mediaId);
                        }
                    }
                    
                    _dbContext.MediaItems.Remove(mediaItem);
                    processedIds.Add(mediaId);
                    result.SuccessCount++;
                }
                else
                {
                    errors.Add($"Media item {mediaId} not found");
                    result.FailureCount++;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting media item {MediaId}", mediaId);
                errors.Add($"Failed to delete item {mediaId}");
                result.FailureCount++;
            }
        }
        
        await _dbContext.SaveChangesAsync();
        
        result.Errors = errors.ToArray();
        result.ProcessedIds = processedIds.ToArray();
        
        return ApiResponse<BatchOperationResult>.Ok(result,
            $"Deleted {result.SuccessCount} of {result.TotalRequested} items");
    }
    
    public async Task<ApiResponse<MediaItem>> ToggleStarAsync(Guid id)
    {
        var mediaItem = await _dbContext.MediaItems.FindAsync(id);
        
        if (mediaItem == null)
        {
            return ApiResponse<MediaItem>.Fail("NOT_FOUND", $"Media item with ID {id} not found", 404);
        }
        
        mediaItem.IsStarred = !mediaItem.IsStarred;
        mediaItem.ModifiedAt = DateTimeOffset.UtcNow;
        
        await _dbContext.SaveChangesAsync();
        return ApiResponse<MediaItem>.Ok(mediaItem, 
            mediaItem.IsStarred ? "Item starred" : "Item unstarred");
    }
    
    public async Task<ApiResponse<MediaItem>> ToggleFavoriteAsync(Guid id)
    {
        var mediaItem = await _dbContext.MediaItems.FindAsync(id);
        
        if (mediaItem == null)
        {
            return ApiResponse<MediaItem>.Fail("NOT_FOUND", $"Media item with ID {id} not found", 404);
        }
        
        mediaItem.IsFavorited = !mediaItem.IsFavorited;
        mediaItem.ModifiedAt = DateTimeOffset.UtcNow;
        
        await _dbContext.SaveChangesAsync();
        return ApiResponse<MediaItem>.Ok(mediaItem,
            mediaItem.IsFavorited ? "Item favorited" : "Item unfavorited");
    }
    
    public async Task<ApiResponse<MediaStatistics>> GetStatisticsAsync(StatisticsQuery? query = null)
    {
        var stats = new MediaStatistics
        {
            TotalCount = await _dbContext.MediaItems.CountAsync(),
            TotalSize = await _dbContext.MediaItems.SumAsync(m => m.SizeInBytes),
            UsedCount = await _dbContext.MediaItems.CountAsync(m => m.IsUsed),
            StarredCount = await _dbContext.MediaItems.CountAsync(m => m.IsStarred),
            FavoritedCount = await _dbContext.MediaItems.CountAsync(m => m.IsFavorited)
        };
        
        stats.UnusedCount = stats.TotalCount - stats.UsedCount;
        
        // Count by type
        stats.CountByType = await _dbContext.MediaItems
            .GroupBy(m => m.Type ?? "unknown")
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Type, x => x.Count);
        
        // Size by type
        stats.SizeByType = await _dbContext.MediaItems
            .GroupBy(m => m.Type ?? "unknown")
            .Select(g => new { Type = g.Key, Size = g.Sum(m => m.SizeInBytes) })
            .ToDictionaryAsync(x => x.Type, x => x.Size);
        
        // Count by status
        stats.CountByStatus = await _dbContext.MediaItems
            .GroupBy(m => m.Status ?? "unknown")
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);
        
        // Latest upload
        stats.LatestUpload = await _dbContext.MediaItems
            .OrderByDescending(m => m.CreatedAt)
            .FirstOrDefaultAsync();
        
        return ApiResponse<MediaStatistics>.Ok(stats);
    }
    
    // Implement remaining methods...
    public async Task<ApiResponse<BatchOperationResult>> BatchCopyAsync(BatchCopyRequest request)
    {
        // Implementation similar to BatchMoveAsync but creates copies
        throw new NotImplementedException();
    }
    
    public async Task<ApiResponse<BatchOperationResult>> BatchTagAsync(BatchTagRequest request)
    {
        // Implementation for batch tagging
        throw new NotImplementedException();
    }
    
    public async Task<ApiResponse<BatchOperationResult>> BatchUpdateAsync(Guid[] ids, UpdateMediaItemDto updates)
    {
        // Implementation for batch updates
        throw new NotImplementedException();
    }
    
    public async Task<ApiResponse<bool>> ValidateMediaAsync(Guid id)
    {
        // Implementation for media validation
        throw new NotImplementedException();
    }
    
    public async Task<ApiResponse<MediaMetadata>> ExtractMetadataAsync(Guid id)
    {
        // Implementation for metadata extraction
        throw new NotImplementedException();
    }
    
    public async Task<ApiResponse<MediaUrlResponse>> GetMediaUrlAsync(Guid id)
    {
        var mediaItem = await _dbContext.MediaItems.FindAsync(id);
        
        if (mediaItem == null)
        {
            return ApiResponse<MediaUrlResponse>.Fail("NOT_FOUND", $"Media item with ID {id} not found", 404);
        }
        
        try
        {
            var url = await _storageService.GetPresignedUrlAsync(mediaItem.PhysicalPath ?? "", 3600);
            var response = new MediaUrlResponse(url, null, 3600);
            return ApiResponse<MediaUrlResponse>.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating URL for media item {MediaId}", id);
            return ApiResponse<MediaUrlResponse>.Fail("URL_ERROR", "Failed to generate media URL", 500);
        }
    }
    
    // Helper methods
    private IQueryable<MediaItem> ApplySorting(IQueryable<MediaItem> query, string? sortBy, string? sortOrder)
    {
        var isDescending = sortOrder?.ToLower() == "desc";
        
        return sortBy?.ToLower() switch
        {
            "name" => isDescending ? query.OrderByDescending(m => m.Name) : query.OrderBy(m => m.Name),
            "created" => isDescending ? query.OrderByDescending(m => m.CreatedAt) : query.OrderBy(m => m.CreatedAt),
            "modified" => isDescending ? query.OrderByDescending(m => m.ModifiedAt) : query.OrderBy(m => m.ModifiedAt),
            "size" => isDescending ? query.OrderByDescending(m => m.SizeInBytes) : query.OrderBy(m => m.SizeInBytes),
            "type" => isDescending ? query.OrderByDescending(m => m.Type) : query.OrderBy(m => m.Type),
            _ => query.OrderBy(m => m.Name)
        };
    }
    
    private async Task<List<Guid>> GetDescendantFolderIds(Guid parentId)
    {
        var folderIds = new List<Guid>();
        var childFolders = await _dbContext.Folders
            .Where(f => f.ParentId == parentId)
            .Select(f => f.Id)
            .ToListAsync();
        
        folderIds.AddRange(childFolders);
        
        foreach (var childId in childFolders)
        {
            var descendants = await GetDescendantFolderIds(childId);
            folderIds.AddRange(descendants);
        }
        
        return folderIds;
    }
    
    private async Task<Dictionary<string, List<FacetValue>>> GenerateFacets(IQueryable<MediaItem> baseQuery)
    {
        var facets = new Dictionary<string, List<FacetValue>>();
        
        // Type facets
        var typeFacets = await baseQuery
            .GroupBy(m => m.Type ?? "unknown")
            .Select(g => new FacetValue { Value = g.Key, Count = g.Count() })
            .ToListAsync();
        facets["type"] = typeFacets;
        
        // Status facets
        var statusFacets = await baseQuery
            .GroupBy(m => m.Status ?? "unknown")
            .Select(g => new FacetValue { Value = g.Key, Count = g.Count() })
            .ToListAsync();
        facets["status"] = statusFacets;
        
        // TODO: Add more facets (tags, folders, etc.) when proper relationships are implemented
        
        return facets;
    }
}