using backend.Domain.Common;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Infrastructure.Http;

/// <summary>
/// Transforms API responses to ensure consistency between backend and frontend
/// This class helps maintain backward compatibility while aligning with frontend expectations
/// </summary>
public static class ResponseTransformer
{
    /// <summary>
    /// Transform PaginatedResponse to match frontend expectations exactly
    /// </summary>
    public static object TransformForFrontend<T>(PaginatedResponse<T> response)
    {
        return new
        {
            data = response.Data,
            success = response.Success,
            message = response.Message,
            timestamp = response.Timestamp,
            requestId = response.RequestId,
            pagination = new
            {
                page = response.Pagination.Page,
                limit = response.Pagination.Limit,
                total = response.Pagination.Total,
                totalPages = response.Pagination.TotalPages,
                hasNext = response.Pagination.HasNext,
                hasPrevious = response.Pagination.HasPrevious
            }
        };
    }
    
    /// <summary>
    /// Transform regular ApiResponse to match frontend expectations
    /// </summary>
    public static object TransformForFrontend<T>(ApiResponse<T> response)
    {
        // For paginated responses, use the specialized transformer
        if (response is PaginatedResponse<T> paginatedResponse)
        {
            return TransformForFrontend(paginatedResponse);
        }
        
        return new
        {
            data = response.Data,
            success = response.Success,
            message = response.Message,
            timestamp = response.Timestamp,
            requestId = response.RequestId
        };
    }
    
    /// <summary>
    /// Creates a standardized error response
    /// </summary>
    public static ApiResponse<T> CreateErrorResponse<T>(string code, string message, int statusCode = 400)
    {
        return ApiResponse<T>.Fail(code, message, statusCode);
    }
    
    /// <summary>
    /// Creates a standardized success response
    /// </summary>
    public static ApiResponse<T> CreateSuccessResponse<T>(T data, string? message = null)
    {
        return ApiResponse<T>.Ok(data, message);
    }
    
    /// <summary>
    /// Creates a paginated success response
    /// </summary>
    public static PaginatedResponse<T> CreatePaginatedResponse<T>(
        IEnumerable<T> items,
        int page,
        int limit,
        int total,
        string? message = null)
    {
        var totalPages = (int)Math.Ceiling(total / (double)limit);
        
        return new PaginatedResponse<T>
        {
            Success = true,
            Data = items,
            Message = message,
            Pagination = new PaginationMetadata
            {
                Page = page,
                Limit = limit,
                Total = total,
                TotalPages = totalPages,
                HasNext = page < totalPages,
                HasPrevious = page > 1
            }
        };
    }
}

/// <summary>
/// Custom JSON converter for ApiResponse to ensure proper serialization
/// </summary>
public class ApiResponseJsonConverter<T> : JsonConverter<ApiResponse<T>>
{
    public override ApiResponse<T>? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // Implement if needed for deserialization
        throw new NotImplementedException("Deserialization not implemented");
    }

    public override void Write(Utf8JsonWriter writer, ApiResponse<T> value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        
        // Always include these fields
        writer.WritePropertyName("success");
        writer.WriteBooleanValue(value.Success);
        
        writer.WritePropertyName("data");
        JsonSerializer.Serialize(writer, value.Data, options);
        
        writer.WritePropertyName("timestamp");
        writer.WriteStringValue(value.Timestamp);
        
        writer.WritePropertyName("requestId");
        writer.WriteStringValue(value.RequestId);
        
        // Conditionally include message
        if (!string.IsNullOrEmpty(value.Message))
        {
            writer.WritePropertyName("message");
            writer.WriteStringValue(value.Message);
        }
        
        // For paginated responses, include pagination
        if (value is PaginatedResponse<T> paginated)
        {
            writer.WritePropertyName("pagination");
            JsonSerializer.Serialize(writer, paginated.Pagination, options);
        }
        
        writer.WriteEndObject();
    }
}