using System;
using System.Collections.Generic;

namespace backend.Domain.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    
    // Simplified message property for frontend compatibility
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? Message 
    { 
        get => Error?.Message ?? Metadata?.Message;
        set 
        {
            if (Metadata == null) 
                Metadata = new ApiMetadata();
            Metadata.Message = value;
        }
    }
    
    // Keep Error for detailed error information but make it optional
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public ApiError? Error { get; set; }
    
    // Keep Metadata for additional info but make it optional
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public ApiMetadata? Metadata { get; set; }
    
    public string RequestId { get; set; } = Guid.NewGuid().ToString();
    
    // Format timestamp as ISO 8601 string for frontend
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("O");

    public static ApiResponse<T> Ok(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message,
            Metadata = message != null ? new ApiMetadata { Message = message } : null
        };
    }

    public static ApiResponse<T> Fail(string errorCode, string errorMessage, int? statusCode = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = errorMessage,
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
    
    // Use 'Limit' as alias for PageSize to match frontend expectations
    public int Limit 
    { 
        get => PageSize; 
        set => PageSize = value; 
    }
    
    // Keep PageSize for internal use but it won't be serialized
    [System.Text.Json.Serialization.JsonIgnore]
    public int PageSize { get; set; }
    
    public int TotalPages { get; set; }
    
    // Use 'Total' as alias for TotalCount to match frontend
    public int Total 
    { 
        get => TotalCount; 
        set => TotalCount = value; 
    }
    
    // Keep TotalCount for internal use but it won't be serialized
    [System.Text.Json.Serialization.JsonIgnore]
    public int TotalCount { get; set; }
    
    public bool HasNext { get; set; }
    public bool HasPrevious { get; set; }
    
    // Optional URLs for HATEOAS support
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public string? NextPageUrl { get; set; }
    
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
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