using backend.Data;
using backend.Models.Dto;
using Microsoft.AspNetCore.Authorization; // Required for [Authorize]
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims; // Required for ClaimsPrincipal
using System.Text.Json;

namespace backend.Api;

// All endpoints in this group require authentication
[Authorize] // Apply authorization to the whole group
public static class UsersApi
{
    // Define claim type for preferences
    private const string PreferencesClaimType = "user_preferences";

    public static RouteGroupBuilder MapUsersApi(this RouteGroupBuilder group)
    {
        // GET /api/users/current
        group.MapGet("/current", GetCurrentUser)
             .WithName("GetCurrentUser")
             .Produces<Ok<UserProfileDto>>()
             .Produces(StatusCodes.Status401Unauthorized);

        // PUT /api/users/profile
        group.MapPut("/profile", UpdateCurrentUserProfile)
             .WithName("UpdateUserProfile")
             .Accepts<UpdateProfileDto>("application/json")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<ValidationProblemDetails>(StatusCodes.Status400BadRequest)
             .Produces(StatusCodes.Status401Unauthorized)
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // GET /api/users/preferences (Added GET for completeness)
         group.MapGet("/preferences", GetCurrentUserPreferences)
             .WithName("GetUserPreferences")
             .Produces<Ok<UserPreferencesDto>>()
             .Produces(StatusCodes.Status401Unauthorized);

        // PUT /api/users/preferences
        group.MapPut("/preferences", UpdateCurrentUserPreferences)
             .WithName("UpdateUserPreferences")
             .Accepts<UserPreferencesDto>("application/json")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<ValidationProblemDetails>(StatusCodes.Status400BadRequest)
             .Produces(StatusCodes.Status401Unauthorized)
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // TODO: Add endpoints for GET /users, GET /users/{id}, PUT /users/recent

        return group;
    }

    // --- Helper ---
    private static async Task<IdentityUser?> GetUserFromPrincipal(ClaimsPrincipal principal, UserManager<IdentityUser> userManager)
    {
        // Get user ID from the 'sub' claim in the JWT
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return null;
        return await userManager.FindByIdAsync(userId);
    }

    // --- Handler Implementations ---

    // GET /current
    public static async Task<Results<Ok<UserProfileDto>, UnauthorizedHttpResult>> GetCurrentUser(
        ClaimsPrincipal principal, // Inject ClaimsPrincipal to get user info from token
        UserManager<IdentityUser> userManager)
    {
        var user = await GetUserFromPrincipal(principal, userManager);
        if (user == null)
        {
            return TypedResults.Unauthorized(); // Should not happen if [Authorize] works
        }

        var profile = new UserProfileDto
        {
            UserId = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty
            // Map other fields if added
        };
        return TypedResults.Ok(profile);
    }

    // PUT /profile
    public static async Task<Results<NoContent, UnauthorizedHttpResult, ValidationProblem, ProblemHttpResult>> UpdateCurrentUserProfile(
        [FromBody] UpdateProfileDto profileDto,
        ClaimsPrincipal principal,
        UserManager<IdentityUser> userManager,
        ILoggerFactory loggerFactory)
    {
         var logger = loggerFactory.CreateLogger("UsersApi");
         var user = await GetUserFromPrincipal(principal, userManager);
         if (user == null) return TypedResults.Unauthorized();

         bool changed = false;

         // Update UserName if provided and different
         if (!string.IsNullOrWhiteSpace(profileDto.UserName) && user.UserName != profileDto.UserName)
         {
             // Check if new username is already taken
             var existingUser = await userManager.FindByNameAsync(profileDto.UserName);
             if (existingUser != null && existingUser.Id != user.Id)
             {
                  return TypedResults.ValidationProblem(new Dictionary<string, string[]> {
                     { nameof(UpdateProfileDto.UserName), new[] { $"Username '{profileDto.UserName}' is already taken." } }
                 });
             }
             var setUserNameResult = await userManager.SetUserNameAsync(user, profileDto.UserName);
             if (!setUserNameResult.Succeeded)
             {
                  logger.LogError("Failed to set UserName for user {UserId}: {Errors}", user.Id, string.Join(", ", setUserNameResult.Errors.Select(e => e.Description)));
                  return TypedResults.Problem("Failed to update username.", statusCode: StatusCodes.Status500InternalServerError);
             }
             changed = true;
         }

         // TODO: Handle Email update (requires confirmation flow usually)
         // TODO: Handle other profile fields

         if (changed)
         {
             var updateResult = await userManager.UpdateAsync(user); // Persist changes
             if (!updateResult.Succeeded)
             {
                 logger.LogError("Failed to update user profile for {UserId}: {Errors}", user.Id, string.Join(", ", updateResult.Errors.Select(e => e.Description)));
                 return TypedResults.Problem("Failed to update profile.", statusCode: StatusCodes.Status500InternalServerError);
             }
              logger.LogInformation("Updated profile for user {UserId}", user.Id);
         }
         else
         {
              logger.LogInformation("No profile changes detected for user {UserId}", user.Id);
         }

         return TypedResults.NoContent();
    }

     // GET /preferences
    public static async Task<Results<Ok<UserPreferencesDto>, UnauthorizedHttpResult>> GetCurrentUserPreferences(
        ClaimsPrincipal principal,
        UserManager<IdentityUser> userManager)
    {
        var user = await GetUserFromPrincipal(principal, userManager);
        if (user == null) return TypedResults.Unauthorized();

        var claims = await userManager.GetClaimsAsync(user);
        var preferencesClaim = claims.FirstOrDefault(c => c.Type == PreferencesClaimType);

        UserPreferencesDto preferences;
        if (preferencesClaim != null && !string.IsNullOrWhiteSpace(preferencesClaim.Value))
        {
            try
            {
                preferences = JsonSerializer.Deserialize<UserPreferencesDto>(preferencesClaim.Value) ?? new UserPreferencesDto(); // Fallback to default if deserialization fails
            }
            catch (JsonException)
            {
                preferences = new UserPreferencesDto(); // Fallback to default on error
            }
        }
        else
        {
            preferences = new UserPreferencesDto(); // Default preferences
        }

        return TypedResults.Ok(preferences);
    }


    // PUT /preferences
    public static async Task<Results<NoContent, UnauthorizedHttpResult, ValidationProblem, ProblemHttpResult>> UpdateCurrentUserPreferences(
        [FromBody] UserPreferencesDto preferencesDto,
        ClaimsPrincipal principal,
        UserManager<IdentityUser> userManager,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("UsersApi");
        var user = await GetUserFromPrincipal(principal, userManager);
        if (user == null) return TypedResults.Unauthorized();

        // Serialize the DTO to JSON
        string preferencesJson;
        try
        {
            preferencesJson = JsonSerializer.Serialize(preferencesDto);
        }
        catch (JsonException ex)
        {
             logger.LogError(ex, "Failed to serialize preferences for user {UserId}", user.Id);
             return TypedResults.ValidationProblem(new Dictionary<string, string[]> { { "", new[] { "Invalid preferences format." } } });
        }

        // Get existing claims
        var claims = await userManager.GetClaimsAsync(user);
        var existingClaim = claims.FirstOrDefault(c => c.Type == PreferencesClaimType);

        IdentityResult result;
        if (existingClaim != null)
        {
            // Replace existing claim if value changed
            if (existingClaim.Value != preferencesJson)
            {
                 result = await userManager.ReplaceClaimAsync(user, existingClaim, new Claim(PreferencesClaimType, preferencesJson));
                 logger.LogInformation("Replaced preferences claim for user {UserId}", user.Id);
            }
            else
            {
                 logger.LogInformation("Preferences unchanged for user {UserId}. Update skipped.", user.Id);
                 return TypedResults.NoContent(); // No change needed
            }
        }
        else
        {
            // Add new claim
            result = await userManager.AddClaimAsync(user, new Claim(PreferencesClaimType, preferencesJson));
             logger.LogInformation("Added preferences claim for user {UserId}", user.Id);
        }

        if (!result.Succeeded)
        {
            logger.LogError("Failed to update preferences claim for user {UserId}: {Errors}", user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
            return TypedResults.Problem("Failed to update preferences.", statusCode: StatusCodes.Status500InternalServerError);
        }

        return TypedResults.NoContent();
    }
}