using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using backend.Domain.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Infrastructure.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly bool _isDevelopment;
    
    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _isDevelopment = environment.IsDevelopment();
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }
    
    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // Get request ID for tracking
        var requestId = context.Items.ContainsKey("RequestId") 
            ? context.Items["RequestId"]?.ToString() 
            : Guid.NewGuid().ToString();
        
        // Log the exception
        _logger.LogError(exception, 
            "Unhandled exception occurred. RequestId: {RequestId}, Path: {Path}, Method: {Method}",
            requestId,
            context.Request.Path,
            context.Request.Method);
        
        // Determine status code and error details
        var (statusCode, errorCode, errorMessage, isRetryable) = GetErrorDetails(exception);
        
        // Create error response
        var response = new ApiResponse<object>
        {
            Success = false,
            Error = new ApiError
            {
                Code = errorCode,
                Message = errorMessage,
                StatusCode = statusCode,
                Retryable = isRetryable,
                Details = _isDevelopment ? new Dictionary<string, object>
                {
                    ["exceptionType"] = exception.GetType().Name,
                    ["stackTrace"] = exception.StackTrace ?? string.Empty,
                    ["innerException"] = exception.InnerException?.Message
                } : null
            },
            RequestId = requestId,
            Timestamp = DateTime.UtcNow
        };
        
        // Set response
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };
        
        var json = JsonSerializer.Serialize(response, jsonOptions);
        await context.Response.WriteAsync(json);
    }
    
    private (int statusCode, string errorCode, string errorMessage, bool isRetryable) GetErrorDetails(Exception exception)
    {
        return exception switch
        {
            // Database exceptions
            DbUpdateConcurrencyException => (
                (int)HttpStatusCode.Conflict,
                "CONCURRENCY_ERROR",
                "The record was modified by another user. Please refresh and try again.",
                true
            ),
            DbUpdateException dbEx when dbEx.InnerException?.Message.Contains("UNIQUE constraint") == true => (
                (int)HttpStatusCode.Conflict,
                "DUPLICATE_ERROR",
                "A record with the same unique value already exists.",
                false
            ),
            DbUpdateException => (
                (int)HttpStatusCode.InternalServerError,
                "DATABASE_ERROR",
                "A database error occurred while processing your request.",
                true
            ),
            
            // Custom exceptions
            ArgumentNullException argNullEx => (
                (int)HttpStatusCode.BadRequest,
                "INVALID_ARGUMENT",
                $"Required parameter is missing: {argNullEx.ParamName}",
                false
            ),
            ArgumentException argEx => (
                (int)HttpStatusCode.BadRequest,
                "INVALID_ARGUMENT",
                argEx.Message,
                false
            ),
            UnauthorizedAccessException => (
                (int)HttpStatusCode.Unauthorized,
                "UNAUTHORIZED",
                "You are not authorized to perform this action.",
                false
            ),
            KeyNotFoundException => (
                (int)HttpStatusCode.NotFound,
                "NOT_FOUND",
                "The requested resource was not found.",
                false
            ),
            NotImplementedException => (
                (int)HttpStatusCode.NotImplemented,
                "NOT_IMPLEMENTED",
                "This feature is not yet implemented.",
                false
            ),
            TimeoutException => (
                (int)HttpStatusCode.RequestTimeout,
                "TIMEOUT",
                "The operation timed out. Please try again.",
                true
            ),
            InvalidOperationException invEx => (
                (int)HttpStatusCode.BadRequest,
                "INVALID_OPERATION",
                invEx.Message,
                false
            ),
            
            // File/IO exceptions
            IOException ioEx when ioEx.Message.Contains("disk") => (
                (int)HttpStatusCode.InsufficientStorage,
                "STORAGE_FULL",
                "Insufficient storage space available.",
                false
            ),
            IOException => (
                (int)HttpStatusCode.InternalServerError,
                "IO_ERROR",
                "An I/O error occurred while processing your request.",
                true
            ),
            
            // Default
            _ => (
                (int)HttpStatusCode.InternalServerError,
                "INTERNAL_ERROR",
                "An unexpected error occurred. Please try again later.",
                true
            )
        };
    }
}

// Extension method to register the middleware
public static class GlobalExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<GlobalExceptionMiddleware>();
    }
}