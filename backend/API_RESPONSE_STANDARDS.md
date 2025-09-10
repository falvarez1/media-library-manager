# API Response Format Standards

## Overview
This document defines the standard response formats for the Media Library Manager API to ensure consistency between backend (.NET) and frontend (TypeScript/React) applications.

## Response Format Alignment

### Standard API Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Resource not found",
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "statusCode": 404,
    "details": { ... }
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Implementation Guidelines

### 1. JSON Serialization Configuration
The API uses camelCase property naming to match JavaScript/TypeScript conventions:

```csharp
// Configured in Program.cs
builder.Services.ConfigureHttpJsonOptions(options => 
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    // ... other settings
});
```

### 2. Response Creation Patterns

#### Success Response
```csharp
// Simple success
return Results.Ok(ApiResponse<MediaItem>.Ok(mediaItem, "Media item created successfully"));

// Paginated success
return Results.Ok(PaginatedResponse<MediaItem>.CreatePaginated(
    items: mediaItems,
    page: 1,
    pageSize: 20,
    totalCount: 150
));
```

#### Error Response
```csharp
// Not found
return Results.NotFound(ApiResponse<MediaItem>.Fail(
    "NOT_FOUND", 
    "Media item not found", 
    404
));

// Validation error
return Results.BadRequest(ApiResponse<MediaItem>.Fail(
    "VALIDATION_ERROR",
    "Invalid input data",
    400
));
```

### 3. Field Mapping

| Backend (C#) | Frontend (TS) | Notes |
|-------------|---------------|--------|
| Success | success | Boolean indicating operation success |
| Data | data | The actual response payload |
| Message | message | Optional user-friendly message |
| Timestamp | timestamp | ISO 8601 formatted string |
| RequestId | requestId | UUID for request tracking |
| Pagination.PageSize | pagination.limit | Items per page |
| Pagination.TotalCount | pagination.total | Total number of items |

### 4. Best Practices

#### Consistency
- Always use the `ApiResponse<T>` wrapper for all API responses
- Maintain consistent error codes across the application
- Use ISO 8601 format for all timestamps

#### Performance
- Include only necessary fields in responses
- Use pagination for large datasets
- Implement response caching where appropriate

#### Error Handling
- Provide meaningful error messages
- Include error codes for programmatic handling
- Log detailed errors server-side, return sanitized errors to client

#### Versioning
- Use URL versioning (e.g., `/api/v1/media`)
- Maintain backward compatibility when possible
- Document breaking changes clearly

### 5. Testing Response Formats

#### Unit Test Example
```csharp
[Fact]
public void ApiResponse_Should_Serialize_To_CamelCase()
{
    var response = ApiResponse<string>.Ok("test", "Success");
    var json = JsonSerializer.Serialize(response, JsonConfiguration.DefaultOptions);
    
    Assert.Contains("\"success\":true", json);
    Assert.Contains("\"data\":\"test\"", json);
    Assert.Contains("\"message\":\"Success\"", json);
}
```

#### Integration Test Example
```csharp
[Fact]
public async Task GetMedia_Should_Return_Correct_Format()
{
    var response = await _client.GetAsync("/api/v1/media/search");
    var content = await response.Content.ReadAsStringAsync();
    var result = JsonSerializer.Deserialize<PaginatedResponse<MediaItem>>(
        content, 
        JsonConfiguration.DefaultOptions
    );
    
    Assert.NotNull(result.Data);
    Assert.NotNull(result.Pagination);
    Assert.True(result.Success);
}
```

## Migration Strategy

### Phase 1: Backend Alignment (Current)
- ✅ Configure JSON serialization for camelCase
- ✅ Update ApiResponse classes with proper field mapping
- ✅ Add response transformers for consistency
- ✅ Document standards

### Phase 2: Frontend Validation
- Verify TypeScript interfaces match response format
- Update API client to handle new format
- Add response validation/transformation if needed

### Phase 3: Testing & Monitoring
- Add integration tests for all endpoints
- Monitor API responses in production
- Collect metrics on response times and errors

## Common Issues & Solutions

### Issue: Property Casing Mismatch
**Problem**: Frontend expects camelCase but receives PascalCase
**Solution**: Configure JSON serialization with `PropertyNamingPolicy = JsonNamingPolicy.CamelCase`

### Issue: Missing Pagination Fields
**Problem**: Frontend expects `limit` but receives `pageSize`
**Solution**: Use property aliases in PaginationMetadata class

### Issue: Nested Error Structure
**Problem**: Frontend expects simple `message` field
**Solution**: Expose `Message` property at root level that reads from Error or Metadata

### Issue: Date Format Inconsistency
**Problem**: Different date formats between systems
**Solution**: Always use ISO 8601 format (DateTime.UtcNow.ToString("O"))

## Monitoring & Observability

### Response Time Metrics
- Track p50, p95, p99 response times
- Alert on responses > 1 second
- Monitor database query performance

### Error Rate Monitoring
- Track 4xx and 5xx error rates
- Alert on error rate > 1%
- Log detailed error context

### Request Tracking
- Include RequestId in all responses
- Correlate logs with RequestId
- Enable distributed tracing

## Security Considerations

### Data Sanitization
- Never expose internal system details in error messages
- Sanitize user input in responses
- Mask sensitive data (e.g., passwords, tokens)

### Rate Limiting Headers
- Include rate limit information in response headers
- Use standard headers: X-RateLimit-Limit, X-RateLimit-Remaining

### CORS Headers
- Configure appropriate CORS policies
- Include only necessary origins
- Use credentials only when required

## Additional Resources

- [Microsoft API Guidelines](https://github.com/microsoft/api-guidelines)
- [REST API Best Practices](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design)
- [JSON API Specification](https://jsonapi.org/)