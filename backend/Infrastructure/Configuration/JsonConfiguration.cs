using Microsoft.AspNetCore.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Infrastructure.Configuration;

/// <summary>
/// Centralized JSON serialization configuration for the API
/// </summary>
public static class JsonConfiguration
{
    /// <summary>
    /// Gets the default JSON serializer options for the application
    /// </summary>
    public static JsonSerializerOptions DefaultOptions => new()
    {
        // Use camelCase for property names to match frontend expectations
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        
        // Write indented JSON in development for readability
        WriteIndented = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development",
        
        // Include fields with null values (explicit nulls are meaningful)
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        
        // Allow trailing commas for flexibility
        AllowTrailingCommas = true,
        
        // Use string representation for enums for better readability
        Converters = 
        {
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
        },
        
        // Handle circular references
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
        
        // Improve performance with property name case insensitivity
        PropertyNameCaseInsensitive = true
    };
    
    /// <summary>
    /// Configure JSON options for ASP.NET Core
    /// </summary>
    public static void ConfigureJsonOptions(JsonOptions options)
    {
        var defaultOptions = DefaultOptions;
        
        options.SerializerOptions.PropertyNamingPolicy = defaultOptions.PropertyNamingPolicy;
        options.SerializerOptions.WriteIndented = defaultOptions.WriteIndented;
        options.SerializerOptions.DefaultIgnoreCondition = defaultOptions.DefaultIgnoreCondition;
        options.SerializerOptions.AllowTrailingCommas = defaultOptions.AllowTrailingCommas;
        options.SerializerOptions.ReferenceHandler = defaultOptions.ReferenceHandler;
        options.SerializerOptions.PropertyNameCaseInsensitive = defaultOptions.PropertyNameCaseInsensitive;
        
        foreach (var converter in defaultOptions.Converters)
        {
            options.SerializerOptions.Converters.Add(converter);
        }
    }
}