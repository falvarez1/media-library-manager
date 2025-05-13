using backend.Data;
using backend.Models;
using backend.Models.Dto;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api;

public static class TagsApi
{
    public static RouteGroupBuilder MapTagsApi(this RouteGroupBuilder group)
    {
        // GET /api/tags
        group.MapGet("/", GetAllTags)
             .WithName("GetTags")
             .Produces<Ok<List<Tag>>>();

        // GET /api/tags/{id}
        group.MapGet("/{id:guid}", GetTagById)
             .WithName("GetTagById")
             .Produces<Ok<Tag>>()
             .Produces<NotFound>();

        // POST /api/tags
        group.MapPost("/", CreateTag)
             .WithName("CreateTag")
             .Accepts<CreateTagDto>("application/json")
             .Produces<Created<Tag>>(StatusCodes.Status201Created)
             .ProducesValidationProblem()
             .ProducesProblem(StatusCodes.Status409Conflict) // For duplicate name
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // PUT /api/tags/{id}
        group.MapPut("/{id:guid}", UpdateTag)
             .WithName("UpdateTag")
             .Accepts<UpdateTagDto>("application/json")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<NotFound>()
             .ProducesValidationProblem()
             .ProducesProblem(StatusCodes.Status409Conflict) // For duplicate name
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // DELETE /api/tags/{id}
        group.MapDelete("/{id:guid}", DeleteTag)
             .WithName("DeleteTag")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<NotFound>()
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        return group;
    }

    // --- Handler Implementations ---

    // GET /
    public static async Task<Ok<List<Tag>>> GetAllTags(AppDbContext db)
    {
        // Consider adding .Include(t => t.MediaItems).ThenInclude(...) if needed, but likely not for a simple list
        var tags = await db.Tags.AsNoTracking().OrderBy(t => t.Name).ToListAsync();
        return TypedResults.Ok(tags);
    }

    // GET /{id}
    public static async Task<Results<Ok<Tag>, NotFound>> GetTagById(Guid id, AppDbContext db)
    {
        var tag = await db.Tags.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        return tag is Tag foundTag ? TypedResults.Ok(foundTag) : TypedResults.NotFound();
    }

    // POST /
    public static async Task<Results<Created<Tag>, ValidationProblem, ProblemHttpResult>> CreateTag(
        [FromBody] CreateTagDto createDto,
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("TagsApi");

        // Normalize tag name (e.g., lowercase, trim)
        var normalizedName = createDto.Name.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(normalizedName))
        {
             return TypedResults.ValidationProblem(new Dictionary<string, string[]> {
                { nameof(CreateTagDto.Name), new[] { "Tag name cannot be empty." } }
            });
        }

        // Check for duplicates (using the unique index)
        var existingTag = await db.Tags.FirstOrDefaultAsync(t => t.Name == normalizedName);
        if (existingTag != null)
        {
             logger.LogWarning("CreateTag failed: Tag with name '{TagName}' already exists (ID: {TagId}).", normalizedName, existingTag.Id);
             // Return conflict or potentially return the existing tag
             return TypedResults.Problem($"Tag '{normalizedName}' already exists.", statusCode: StatusCodes.Status409Conflict);
        }


        var newTag = new Tag
        {
            Id = Guid.NewGuid(),
            Name = normalizedName // Store normalized name
        };

        try
        {
            db.Tags.Add(newTag);
            await db.SaveChangesAsync();
            logger.LogInformation("Created new Tag with ID: {TagId}, Name: {TagName}", newTag.Id, newTag.Name);
            return TypedResults.Created($"/api/tags/{newTag.Id}", newTag);
        }
        catch (DbUpdateException ex) // Handles potential race condition if index fails despite check
        {
            logger.LogError(ex, "Failed to save new Tag '{TagName}' to database. Possible duplicate.", newTag.Name);
             if (ex.InnerException?.Message.Contains("UNIQUE constraint failed: Tags.Name") ?? false)
             {
                 return TypedResults.Problem($"Tag '{newTag.Name}' already exists.", statusCode: StatusCodes.Status409Conflict);
             }
            return TypedResults.Problem("Failed to save tag information.", statusCode: StatusCodes.Status500InternalServerError);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred while creating Tag '{TagName}'.", newTag.Name);
            return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    // PUT /{id}
    public static async Task<Results<NoContent, NotFound, ValidationProblem, ProblemHttpResult>> UpdateTag(
        Guid id,
        [FromBody] UpdateTagDto updateDto,
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
         var logger = loggerFactory.CreateLogger("TagsApi");

        var existingTag = await db.Tags.FindAsync(id);
        if (existingTag is null)
        {
            return TypedResults.NotFound();
        }

        var normalizedName = updateDto.Name.Trim().ToLowerInvariant();
         if (string.IsNullOrWhiteSpace(normalizedName))
        {
             return TypedResults.ValidationProblem(new Dictionary<string, string[]> {
                { nameof(UpdateTagDto.Name), new[] { "Tag name cannot be empty." } }
            });
        }

        // Check if name changed and if new name conflicts
        if (existingTag.Name != normalizedName)
        {
            var conflictingTag = await db.Tags.FirstOrDefaultAsync(t => t.Id != id && t.Name == normalizedName);
            if (conflictingTag != null)
            {
                 logger.LogWarning("UpdateTag failed: Tag with name '{TagName}' already exists (ID: {TagId}).", normalizedName, conflictingTag.Id);
                 return TypedResults.Problem($"Tag '{normalizedName}' already exists.", statusCode: StatusCodes.Status409Conflict);
            }

            existingTag.Name = normalizedName;

            try
            {
                await db.SaveChangesAsync();
                logger.LogInformation("Updated Tag ID: {TagId} to Name: {TagName}", id, normalizedName);
            }
             catch (DbUpdateConcurrencyException ex)
            {
                 logger.LogWarning(ex, "Concurrency conflict updating Tag ID {TagId}", id);
                 return TypedResults.Problem("The record you attempted to edit was modified by another user.", statusCode: StatusCodes.Status409Conflict);
            }
            catch (DbUpdateException ex) // Handles potential race condition if index fails despite check
            {
                logger.LogError(ex, "Failed to update Tag ID {TagId} to Name '{TagName}'. Possible duplicate.", id, normalizedName);
                 if (ex.InnerException?.Message.Contains("UNIQUE constraint failed: Tags.Name") ?? false)
                 {
                     return TypedResults.Problem($"Tag '{normalizedName}' already exists.", statusCode: StatusCodes.Status409Conflict);
                 }
                return TypedResults.Problem("Failed to save tag information.", statusCode: StatusCodes.Status500InternalServerError);
            }
             catch (Exception ex)
            {
                logger.LogError(ex, "An unexpected error occurred while updating Tag ID {TagId}", id);
                return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
            }
        }
        else
        {
             logger.LogInformation("No name change detected for Tag ID {TagId}. Update skipped.", id);
        }

        return TypedResults.NoContent();
    }

    // DELETE /{id}
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> DeleteTag(
        Guid id,
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("TagsApi");
        var existingTag = await db.Tags.FindAsync(id); // No need to Include MediaItems for simple delete

        if (existingTag is null)
        {
            return TypedResults.NotFound();
        }

        try
        {
            // EF Core handles removing relationships in the join table automatically
            db.Tags.Remove(existingTag);
            await db.SaveChangesAsync();
            logger.LogInformation("Deleted Tag with ID: {TagId}, Name: {TagName}", id, existingTag.Name);
            return TypedResults.NoContent();
        }
         catch (DbUpdateConcurrencyException ex)
        {
            logger.LogWarning(ex, "Concurrency conflict deleting Tag ID {TagId}", id);
            return TypedResults.Problem("The record you attempted to delete was modified by another user.", statusCode: StatusCodes.Status409Conflict);
        }
        catch (DbUpdateException ex)
        {
            // This might happen if there are unexpected FK constraints, though unlikely with implicit M2M
            logger.LogError(ex, "Failed to delete Tag ID {TagId} from database.", id);
            return TypedResults.Problem("Failed to delete tag information.", statusCode: StatusCodes.Status500InternalServerError);
        }
         catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred while deleting Tag ID {TagId}", id);
            return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}