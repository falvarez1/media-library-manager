using System;

namespace backend.Models.Dto;

public class MediaSearchRequest
{
    // Search and filtering
    public string? Query { get; set; }
    public string[]? Types { get; set; }
    public string[]? Tags { get; set; }
    public string? Status { get; set; }
    public Guid? FolderId { get; set; }
    public bool? IncludeSubfolders { get; set; }
    
    // Date filtering
    public DateTimeOffset? DateFrom { get; set; }
    public DateTimeOffset? DateTo { get; set; }
    
    // Boolean filters
    public bool? IsStarred { get; set; }
    public bool? IsFavorited { get; set; }
    public bool? IsUsed { get; set; }
    
    // Size filtering
    public long? SizeMin { get; set; }
    public long? SizeMax { get; set; }
    
    // Sorting
    public string? SortBy { get; set; } = "name";
    public string? SortOrder { get; set; } = "asc";
    
    // Pagination
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    
    // Additional options
    public bool? IncludeFacets { get; set; }
    public string[]? FacetFields { get; set; }
}

public class BatchMoveRequest
{
    public Guid[] MediaIds { get; set; } = Array.Empty<Guid>();
    public Guid TargetFolderId { get; set; }
}

public class BatchCopyRequest
{
    public Guid[] MediaIds { get; set; } = Array.Empty<Guid>();
    public Guid TargetFolderId { get; set; }
    public bool PreserveTags { get; set; } = true;
}

public class BatchDeleteRequest
{
    public Guid[] MediaIds { get; set; } = Array.Empty<Guid>();
    public bool SkipUsedItems { get; set; } = true;
}

public class BatchTagRequest
{
    public Guid[] MediaIds { get; set; } = Array.Empty<Guid>();
    public string[] TagsToAdd { get; set; } = Array.Empty<string>();
    public string[]? TagsToRemove { get; set; }
    public bool ReplaceExisting { get; set; } = false;
}

public class MediaUrlResponse
{
    public string Url { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int ExpiresInSeconds { get; set; }
    
    public MediaUrlResponse(string url, string? thumbnailUrl, int expiresInSeconds)
    {
        Url = url;
        ThumbnailUrl = thumbnailUrl;
        ExpiresInSeconds = expiresInSeconds;
    }
}

// Additional search-related DTOs
public class SearchSuggestion
{
    public string Value { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "tag", "folder", "name"
    public int MatchCount { get; set; }
}

public class SearchFilter
{
    public string Field { get; set; } = string.Empty;
    public string Operator { get; set; } = "equals"; // equals, contains, greater, less, between
    public object? Value { get; set; }
    public object? ValueTo { get; set; } // For range queries
}

public class BatchOperationResult
{
    public int TotalRequested { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public string[] Errors { get; set; } = Array.Empty<string>();
    public Guid[] ProcessedIds { get; set; } = Array.Empty<Guid>();
    public Dictionary<string, object>? Details { get; set; }
}