using backend.Data;
using backend.Models;
using backend.Models.Dto; // Added DTO namespace
using backend.Services; // Added Services namespace
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc; // For [FromForm]
using Microsoft.EntityFrameworkCore;
using System.Text.Json; // For JSON serialization

namespace backend.Api;

public static class MediaApi
{
    public static RouteGroupBuilder MapMediaApi(this RouteGroupBuilder group)
    {
        // GET /api/media
        group.MapGet("/", GetAllMediaItems)
             .WithName("GetMedia")
             .Produces<Ok<List<MediaItem>>>(); // Define response type for Swagger

        // GET /api/media/{id}
        group.MapGet("/{id:guid}", GetMediaItemById)
             .WithName("GetMediaById")
             .Produces<Ok<MediaItem>>()
             .Produces<NotFound>();

        // POST /api/media
        // Expects multipart/form-data with 'file' and form fields matching CreateMediaItemDto
        group.MapPost("/", CreateMediaItem)
             .WithName("CreateMedia")
             .Accepts<IFormFile>("multipart/form-data") // Hint for Swagger/clients
             .Produces<Created<MediaItem>>(StatusCodes.Status201Created)
             .ProducesValidationProblem() // For potential DTO validation errors
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // PUT /api/media/{id}
        group.MapPut("/{id:guid}", UpdateMediaItem)
             .WithName("UpdateMedia")
             .Accepts<UpdateMediaItemDto>("application/json")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<NotFound>()
             .ProducesValidationProblem()
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // DELETE /api/media/{id}
        group.MapDelete("/{id:guid}", DeleteMediaItem)
             .WithName("DeleteMedia")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<NotFound>()
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // TODO: Add batch operations if needed (batch update, batch delete)

        return group;
    }

    // Handler for GET /api/media
    public static async Task<Ok<List<MediaItem>>> GetAllMediaItems(AppDbContext db)
    {
        // TODO: Implement filtering, sorting, pagination based on query parameters
        var mediaItems = await db.MediaItems.AsNoTracking().ToListAsync(); // Use AsNoTracking for read-only queries
        return TypedResults.Ok(mediaItems);
    }

    // Handler for GET /api/media/{id}
    public static async Task<Results<Ok<MediaItem>, NotFound>> GetMediaItemById(Guid id, AppDbContext db)
    {
        var mediaItem = await db.MediaItems.FindAsync(id);

        return mediaItem is MediaItem item
            ? TypedResults.Ok(item)
            : TypedResults.NotFound();
    }

    // Handler for POST /api/media
    // Binds the uploaded file and form data matching CreateMediaItemDto properties
    // Note: We bind IFormFile directly and access other form fields via HttpRequest
    // to avoid Swashbuckle issues with complex types in multipart/form-data.
    public static async Task<Results<Created<MediaItem>, ValidationProblem, ProblemHttpResult>> CreateMediaItem(
        IFormFile file, // The uploaded file (bound by name 'file')
        HttpRequest request, // Inject HttpRequest to access form fields
        AppDbContext db,
        IFileStorageService storageService,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("MediaApi"); // Get logger instance

        if (file == null || file.Length == 0)
        {
            // This check might be redundant if IFormFile binding handles it, but good practice
             return TypedResults.ValidationProblem(new Dictionary<string, string[]> {
                { "file", new[] { "An image file is required." } }
            });
        }

        // TODO: Add more robust validation (file type, size limits, etc.)

        // Manually bind form fields to DTO
        var form = await request.ReadFormAsync();
        var createDto = new CreateMediaItemDto
        {
            Type = form["Type"],
            Name = form["Name"], // Usually overridden by filename below, but might be provided
            FolderId = form.ContainsKey("FolderId") && Guid.TryParse(form["FolderId"], out var folderId) ? folderId : null,
            Path = form["Path"],
            Tags = form.ContainsKey("Tags") ? form["Tags"].ToString().Split(',').Select(t => t.Trim()).ToList() : null, // Assuming comma-separated
            UsedIn = form.ContainsKey("UsedIn") ? form["UsedIn"].ToString().Split(',').Select(t => t.Trim()).ToList() : null, // Assuming comma-separated
            IsStarred = form.ContainsKey("IsStarred") && bool.TryParse(form["IsStarred"], out var isStarred) && isStarred,
            IsFavorited = form.ContainsKey("IsFavorited") && bool.TryParse(form["IsFavorited"], out var isFavorited) && isFavorited,
            Status = form["Status"]
        };

        // TODO: Add validation for manually bound DTO fields if needed

        string relativePath;
        try
        {
            // Determine subdirectory based on type (e.g., "images", "videos", "documents")
            string subDirectory = createDto.Type?.ToLowerInvariant() ?? "other";
            relativePath = await storageService.SaveFileAsync(file, subDirectory);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to save uploaded file '{FileName}'", file.FileName);
            return TypedResults.Problem("Failed to save file.", statusCode: StatusCodes.Status500InternalServerError);
        }

        var newItem = new MediaItem
        {
            Id = Guid.NewGuid(),
            Type = createDto.Type,
            Name = file.FileName, // Use uploaded filename
            FolderId = createDto.FolderId,
            Path = createDto.Path, // Logical path provided by client
            PhysicalPath = relativePath, // Path returned by storage service
            SizeInBytes = file.Length,
            // TODO: Extract Dimensions/Duration if possible (requires more complex processing)
            CreatedAt = DateTimeOffset.UtcNow,
            ModifiedAt = DateTimeOffset.UtcNow,
            IsUsed = false, // Default
            UsedIn = createDto.UsedIn != null ? JsonSerializer.Serialize(createDto.UsedIn) : null,
            Tags = createDto.Tags != null ? JsonSerializer.Serialize(createDto.Tags) : null,
            // AiTags = null, // AI tags likely generated later
            IsStarred = createDto.IsStarred,
            IsFavorited = createDto.IsFavorited,
            Status = createDto.Status ?? "in_review", // Default status
            // Attribution = null, // Attribution likely added later
            // Metadata = null // Metadata likely added later or extracted
        };

        try
        {
            db.MediaItems.Add(newItem);
            await db.SaveChangesAsync();

            logger.LogInformation("Created new MediaItem with ID: {MediaItemId}", newItem.Id);

            // Return 201 Created with the new item and location header
            return TypedResults.Created($"/api/media/{newItem.Id}", newItem);
        }
        catch (DbUpdateException ex)
        {
             logger.LogError(ex, "Failed to save new MediaItem to database for file '{FileName}'", file.FileName);
             // TODO: Consider deleting the saved file if DB save fails (compensating action)
             return TypedResults.Problem("Failed to save media information.", statusCode: StatusCodes.Status500InternalServerError);
        }
         catch (Exception ex) // Catch unexpected errors
        {
            logger.LogError(ex, "An unexpected error occurred while creating MediaItem for file '{FileName}'", file.FileName);
            return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    // Handler for PUT /api/media/{id}
    public static async Task<Results<NoContent, NotFound, ValidationProblem, ProblemHttpResult>> UpdateMediaItem(
        Guid id,
        [FromBody] UpdateMediaItemDto updateDto, // Get DTO from request body
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("MediaApi");

        var existingItem = await db.MediaItems.FindAsync(id);

        if (existingItem is null)
        {
            logger.LogWarning("UpdateMediaItem failed: Item with ID {MediaItemId} not found.", id);
            return TypedResults.NotFound();
        }

        // Update properties only if they are provided in the DTO
        bool changed = false;

        if (updateDto.Name is not null && existingItem.Name != updateDto.Name)
        {
            existingItem.Name = updateDto.Name;
            changed = true;
        }
        if (updateDto.FolderId.HasValue && existingItem.FolderId != updateDto.FolderId)
        {
            // TODO: Validate FolderId exists if implementing folders later
            existingItem.FolderId = updateDto.FolderId;
            changed = true;
        }
        if (updateDto.Path is not null && existingItem.Path != updateDto.Path)
        {
            existingItem.Path = updateDto.Path;
            changed = true;
        }
        if (updateDto.IsUsed.HasValue && existingItem.IsUsed != updateDto.IsUsed.Value)
        {
            existingItem.IsUsed = updateDto.IsUsed.Value;
            changed = true;
        }
        if (updateDto.UsedIn is not null)
        {
            // Simple comparison after serialization; more robust comparison might be needed
            var newUsedInJson = JsonSerializer.Serialize(updateDto.UsedIn);
            if (existingItem.UsedIn != newUsedInJson)
            {
                 existingItem.UsedIn = newUsedInJson;
                 changed = true;
            }
        }
        if (updateDto.Tags is not null)
        {
            var newTagsJson = JsonSerializer.Serialize(updateDto.Tags);
             if (existingItem.Tags != newTagsJson)
            {
                existingItem.Tags = newTagsJson;
                changed = true;
            }
        }
        if (updateDto.IsStarred.HasValue && existingItem.IsStarred != updateDto.IsStarred.Value)
        {
            existingItem.IsStarred = updateDto.IsStarred.Value;
            changed = true;
        }
        if (updateDto.IsFavorited.HasValue && existingItem.IsFavorited != updateDto.IsFavorited.Value)
        {
            existingItem.IsFavorited = updateDto.IsFavorited.Value;
            changed = true;
        }
        if (updateDto.Status is not null && existingItem.Status != updateDto.Status)
        {
            // TODO: Add validation for allowed status values
            existingItem.Status = updateDto.Status;
            changed = true;
        }
        if (updateDto.Attribution is not null && existingItem.Attribution != updateDto.Attribution)
        {
             // Assuming Attribution is already a JSON string in DTO
            existingItem.Attribution = updateDto.Attribution;
            changed = true;
        }
         if (updateDto.Metadata is not null && existingItem.Metadata != updateDto.Metadata)
        {
             // Assuming Metadata is already a JSON string in DTO
            existingItem.Metadata = updateDto.Metadata;
            changed = true;
        }
        if (updateDto.RejectionReason is not null && existingItem.RejectionReason != updateDto.RejectionReason)
        {
            existingItem.RejectionReason = updateDto.RejectionReason;
            changed = true;
        }

        // If any property changed, update the ModifiedAt timestamp and save
        if (changed)
        {
            existingItem.ModifiedAt = DateTimeOffset.UtcNow;
            try
            {
                await db.SaveChangesAsync();
                logger.LogInformation("Updated MediaItem with ID: {MediaItemId}", id);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                 logger.LogWarning(ex, "Concurrency conflict updating MediaItem ID {MediaItemId}", id);
                 // Could return Conflict (409) or handle differently
                 return TypedResults.Problem("The record you attempted to edit was modified by another user.", statusCode: StatusCodes.Status409Conflict);
            }
            catch (DbUpdateException ex)
            {
                logger.LogError(ex, "Failed to update MediaItem ID {MediaItemId} in database.", id);
                return TypedResults.Problem("Failed to save media information.", statusCode: StatusCodes.Status500InternalServerError);
            }
             catch (Exception ex) // Catch unexpected errors
            {
                logger.LogError(ex, "An unexpected error occurred while updating MediaItem ID {MediaItemId}", id);
                return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
            }
        }
        else
        {
             logger.LogInformation("No changes detected for MediaItem ID {MediaItemId}. Update skipped.", id);
        }


        return TypedResults.NoContent(); // Return 204 No Content on success
    }
    // Handler for DELETE /api/media/{id}
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> DeleteMediaItem(
        Guid id,
        AppDbContext db,
        IFileStorageService storageService,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("MediaApi");

        var existingItem = await db.MediaItems.FindAsync(id);

        if (existingItem is null)
        {
            // Item doesn't exist, consider the delete successful (idempotent)
            logger.LogWarning("DeleteMediaItem: Item with ID {MediaItemId} not found. Considered successful.", id);
            return TypedResults.NoContent();
        }

        // --- Attempt to delete physical file first (optional strategy) ---
        // Alternatively, delete DB record first, then file. Consider transactionality needs.
        bool fileDeleted = false;
        if (!string.IsNullOrWhiteSpace(existingItem.PhysicalPath))
        {
            try
            {
                fileDeleted = await storageService.DeleteFileAsync(existingItem.PhysicalPath);
                if (!fileDeleted)
                {
                    // Log warning but proceed with DB deletion
                    logger.LogWarning("Failed to delete physical file '{PhysicalPath}' for MediaItem ID {MediaItemId}. Proceeding with database record deletion.", existingItem.PhysicalPath, id);
                }
                 else
                {
                     logger.LogInformation("Successfully deleted physical file '{PhysicalPath}' for MediaItem ID {MediaItemId}.", existingItem.PhysicalPath, id);
                }
            }
            catch (Exception ex)
            {
                 // Log error but proceed with DB deletion
                 logger.LogError(ex, "Error deleting physical file '{PhysicalPath}' for MediaItem ID {MediaItemId}. Proceeding with database record deletion.", existingItem.PhysicalPath, id);
            }
        }
        else
        {
             logger.LogWarning("PhysicalPath was null or empty for MediaItem ID {MediaItemId}. Skipping file deletion.", id);
        }
        // --- End File Deletion ---


        try
        {
            db.MediaItems.Remove(existingItem);
            await db.SaveChangesAsync();
            logger.LogInformation("Deleted MediaItem with ID: {MediaItemId} from database.", id);
            return TypedResults.NoContent();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            logger.LogWarning(ex, "Concurrency conflict deleting MediaItem ID {MediaItemId}", id);
            // Item might have been deleted by another request already
            return TypedResults.Problem("The record you attempted to delete was modified by another user.", statusCode: StatusCodes.Status409Conflict);
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Failed to delete MediaItem ID {MediaItemId} from database.", id);
            // If file deletion succeeded, this leaves an orphaned file. Consider rollback/cleanup strategy.
            return TypedResults.Problem("Failed to delete media information from database.", statusCode: StatusCodes.Status500InternalServerError);
        }
         catch (Exception ex) // Catch unexpected errors
        {
            logger.LogError(ex, "An unexpected error occurred while deleting MediaItem ID {MediaItemId}", id);
            return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}