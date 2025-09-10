using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace backend.Infrastructure.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;
    
    public RequestLoggingMiddleware(
        RequestDelegate next,
        ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        // Generate and store request ID
        var requestId = Guid.NewGuid().ToString();
        context.Items["RequestId"] = requestId;
        context.Response.Headers["X-Request-Id"] = requestId;
        
        // Start timing
        var stopwatch = Stopwatch.StartNew();
        
        // Log request
        await LogRequest(context, requestId);
        
        // Capture original response body stream
        var originalResponseBodyStream = context.Response.Body;
        
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;
        
        try
        {
            // Process request
            await _next(context);
        }
        finally
        {
            // Log response
            stopwatch.Stop();
            await LogResponse(context, requestId, stopwatch.ElapsedMilliseconds);
            
            // Copy response body back to original stream
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalResponseBodyStream);
        }
    }
    
    private async Task LogRequest(HttpContext context, string requestId)
    {
        // Don't log sensitive endpoints
        if (IsSensitivePath(context.Request.Path))
        {
            _logger.LogInformation(
                "API Request {RequestId}: {Method} {Path} [SENSITIVE]",
                requestId,
                context.Request.Method,
                context.Request.Path);
            return;
        }
        
        // Enable buffering to allow multiple reads of request body
        context.Request.EnableBuffering();
        
        var requestInfo = new StringBuilder();
        requestInfo.AppendLine($"HTTP Request Information - ID: {requestId}");
        requestInfo.AppendLine($"Method: {context.Request.Method}");
        requestInfo.AppendLine($"Path: {context.Request.Path}");
        requestInfo.AppendLine($"QueryString: {context.Request.QueryString}");
        requestInfo.AppendLine($"Headers: {FormatHeaders(context.Request.Headers)}");
        
        // Read request body for POST/PUT
        if (context.Request.Method == "POST" || context.Request.Method == "PUT" || context.Request.Method == "PATCH")
        {
            context.Request.Body.Seek(0, SeekOrigin.Begin);
            using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            context.Request.Body.Seek(0, SeekOrigin.Begin);
            
            // Truncate large bodies
            if (body.Length > 1000)
            {
                body = body.Substring(0, 1000) + "...[truncated]";
            }
            
            requestInfo.AppendLine($"Body: {body}");
        }
        
        _logger.LogInformation(requestInfo.ToString());
    }
    
    private async Task LogResponse(HttpContext context, string requestId, long elapsedMs)
    {
        // Don't log response body for sensitive or binary content
        if (IsSensitivePath(context.Request.Path) || IsBinaryResponse(context.Response.ContentType))
        {
            _logger.LogInformation(
                "API Response {RequestId}: {StatusCode} - {ElapsedMs}ms",
                requestId,
                context.Response.StatusCode,
                elapsedMs);
            return;
        }
        
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(context.Response.Body).ReadToEndAsync();
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        
        // Truncate large responses
        if (responseBody.Length > 1000)
        {
            responseBody = responseBody.Substring(0, 1000) + "...[truncated]";
        }
        
        var responseInfo = new StringBuilder();
        responseInfo.AppendLine($"HTTP Response Information - ID: {requestId}");
        responseInfo.AppendLine($"StatusCode: {context.Response.StatusCode}");
        responseInfo.AppendLine($"ElapsedTime: {elapsedMs}ms");
        responseInfo.AppendLine($"Headers: {FormatHeaders(context.Response.Headers)}");
        
        // Only log body for non-success status codes or in development
        if (context.Response.StatusCode >= 400)
        {
            responseInfo.AppendLine($"Body: {responseBody}");
        }
        
        if (context.Response.StatusCode >= 500)
        {
            _logger.LogError(responseInfo.ToString());
        }
        else if (context.Response.StatusCode >= 400)
        {
            _logger.LogWarning(responseInfo.ToString());
        }
        else
        {
            _logger.LogInformation(
                "API Response {RequestId}: {StatusCode} - {ElapsedMs}ms",
                requestId,
                context.Response.StatusCode,
                elapsedMs);
        }
    }
    
    private static bool IsSensitivePath(PathString path)
    {
        var pathValue = path.Value?.ToLower() ?? string.Empty;
        return pathValue.Contains("/auth/") || 
               pathValue.Contains("/login") || 
               pathValue.Contains("/register") ||
               pathValue.Contains("/password");
    }
    
    private static bool IsBinaryResponse(string? contentType)
    {
        if (string.IsNullOrEmpty(contentType))
            return false;
            
        return contentType.StartsWith("image/") ||
               contentType.StartsWith("video/") ||
               contentType.StartsWith("audio/") ||
               contentType.StartsWith("application/octet-stream") ||
               contentType.StartsWith("application/pdf");
    }
    
    private static string FormatHeaders(IHeaderDictionary headers)
    {
        var formattedHeaders = new StringBuilder();
        foreach (var header in headers)
        {
            // Skip sensitive headers
            if (header.Key.Equals("Authorization", StringComparison.OrdinalIgnoreCase) ||
                header.Key.Equals("Cookie", StringComparison.OrdinalIgnoreCase))
            {
                formattedHeaders.Append($"{header.Key}: [REDACTED], ");
            }
            else
            {
                formattedHeaders.Append($"{header.Key}: {header.Value}, ");
            }
        }
        return formattedHeaders.ToString().TrimEnd(',', ' ');
    }
}

// Extension method to register the middleware
public static class RequestLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RequestLoggingMiddleware>();
    }
}