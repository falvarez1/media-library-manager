using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

// Request DTOs
public record BatchMoveRequest(
    [Required] Guid[] MediaIds,
    [Required] Guid TargetFolderId
);

public record BatchCopyRequest(
    [Required] Guid[] MediaIds,
    [Required] Guid TargetFolderId
);

public record BatchDeleteRequest(
    [Required] Guid[] MediaIds
);

public record BatchTagRequest(
    [Required] Guid[] MediaIds,
    [Required] string[] TagsToAdd,
    string[]? TagsToRemove
);

public record MediaSearchRequest(
    string? Query,
    string[]? Types,
    string[]? Tags,
    string? Status,
    DateTime? DateFrom,
    DateTime? DateTo,
    bool? IsStarred,
    bool? IsFavorited,
    bool? IsUsed,
    Guid? FolderId,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "Name",
    string SortOrder = "asc"
);

// Response DTOs
public record BatchOperationResult(
    int TotalItems,
    int SuccessCount,
    int FailureCount,
    string[] Errors,
    Guid[] ProcessedIds
);

public record MediaUrlResponse(
    string Url,
    string? ThumbnailUrl,
    int ExpirySeconds
);

public record PaginatedResult<T>(
    T[] Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
)
{
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}