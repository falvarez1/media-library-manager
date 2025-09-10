using System;
using System.Collections.Generic;

namespace backend.Domain.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public ApiError? Error { get; set; }
    public ApiMetadata Metadata { get; set; } = new();
    public string RequestId { get; set; } = Guid.NewGuid().ToString();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> Ok(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Metadata = new ApiMetadata { Message = message }
        };
    }

    public static ApiResponse<T> Fail(string errorCode, string errorMessage, int? statusCode = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = new ApiError
            {
                Code = errorCode,
                Message = errorMessage,
                StatusCode = statusCode
            }
        };
    }
}

public class PaginatedResponse<T> : ApiResponse<IEnumerable<T>>
{
    public PaginationMetadata Pagination { get; set; } = new();
    public Dictionary<string, List<FacetValue>>? Facets { get; set; }

    public static PaginatedResponse<T> CreatePaginated(
        IEnumerable<T> items, 
        int page, 
        int pageSize, 
        int totalCount,
        Dictionary<string, List<FacetValue>>? facets = null)
    {
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        
        return new PaginatedResponse<T>
        {
            Success = true,
            Data = items,
            Pagination = new PaginationMetadata
            {
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
                TotalCount = totalCount,
                HasNext = page < totalPages,
                HasPrevious = page > 1
            },
            Facets = facets
        };
    }
}

public class PaginationMetadata
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }
    public bool HasNext { get; set; }
    public bool HasPrevious { get; set; }
    public string? NextPageUrl { get; set; }
    public string? PreviousPageUrl { get; set; }
}

public class ApiError
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? StatusCode { get; set; }
    public string? Field { get; set; }
    public Dictionary<string, object>? Details { get; set; }
    public List<ValidationError>? ValidationErrors { get; set; }
    public bool Retryable { get; set; }
    public int? RetryAfter { get; set; }
}

public class ValidationError
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Code { get; set; }
}

public class ApiMetadata
{
    public string? Message { get; set; }
    public Dictionary<string, object>? Additional { get; set; }
    public string? Version { get; set; } = "1.0";
}

public class FacetValue
{
    public string Value { get; set; } = string.Empty;
    public int Count { get; set; }
    public string? DisplayName { get; set; }
}