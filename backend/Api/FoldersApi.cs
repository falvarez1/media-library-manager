using backend.Data;
using backend.Models;
using backend.Models.Dto;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api;

public static class FoldersApi
{
    public static RouteGroupBuilder MapFoldersApi(this RouteGroupBuilder group)
    {
        // GET /api/folders
        group.MapGet("/", GetAllFolders)
             .WithName("GetFolders")
             .Produces<Ok<List<Folder>>>();

        // GET /api/folders/{id}
        group.MapGet("/{id:guid}", GetFolderById)
             .WithName("GetFolderById")
             .Produces<Ok<Folder>>()
             .Produces<NotFound>();

        // POST /api/folders
        group.MapPost("/", CreateFolder)
             .WithName("CreateFolder")
             .Accepts<CreateFolderDto>("application/json")
             .Produces<Created<Folder>>(StatusCodes.Status201Created)
             .ProducesValidationProblem()
             .ProducesProblem(StatusCodes.Status400BadRequest) // For invalid ParentId
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // PUT /api/folders/{id}
        group.MapPut("/{id:guid}", UpdateFolder)
             .WithName("UpdateFolder")
             .Accepts<UpdateFolderDto>("application/json")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<NotFound>()
             .ProducesValidationProblem()
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // DELETE /api/folders/{id}
        group.MapDelete("/{id:guid}", DeleteFolder)
             .WithName("DeleteFolder")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<NotFound>()
             .ProducesProblem(StatusCodes.Status400BadRequest) // For deleting non-empty folder
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // GET /api/folders/tree - Get hierarchical folder structure
        group.MapGet("/tree", GetFolderTree)
             .WithName("GetFolderTree")
             .Produces<Ok<List<FolderTreeNodeDto>>>();

        // GET /api/folders/{id}/contents - Get media items in a folder
        group.MapGet("/{id:guid}/contents", GetFolderContents)
             .WithName("GetFolderContents")
             .Produces<Ok<List<MediaItem>>>() // Consider DTO?
             .Produces<NotFound>();

        return group;
    }

    // --- Handler Implementations ---

    // GET /
    public static async Task<Ok<List<Folder>>> GetAllFolders(AppDbContext db)
    {
        var folders = await db.Folders.AsNoTracking().ToListAsync();
        return TypedResults.Ok(folders);
    }

    // GET /{id}
    public static async Task<Results<Ok<Folder>, NotFound>> GetFolderById(Guid id, AppDbContext db)
    {
        // Include children and parent for context? Decide based on frontend needs.
        var folder = await db.Folders
                             // .Include(f => f.Children) // Example: Eager load children
                             // .Include(f => f.Parent)   // Example: Eager load parent
                             .AsNoTracking()
                             .FirstOrDefaultAsync(f => f.Id == id);

        return folder is Folder foundFolder
            ? TypedResults.Ok(foundFolder)
            : TypedResults.NotFound();
    }

    // POST /
    public static async Task<Results<Created<Folder>, ValidationProblem, ProblemHttpResult>> CreateFolder(
        [FromBody] CreateFolderDto createDto,
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("FoldersApi");
        string parentPath = "";

        // Validate ParentId if provided
        if (createDto.ParentId.HasValue)
        {
            var parentFolder = await db.Folders.AsNoTracking()
                                         .FirstOrDefaultAsync(f => f.Id == createDto.ParentId.Value);
            if (parentFolder == null)
            {
                logger.LogWarning("CreateFolder failed: Parent folder with ID {ParentId} not found.", createDto.ParentId.Value);
                return TypedResults.Problem($"Parent folder with ID {createDto.ParentId.Value} not found.", statusCode: StatusCodes.Status400BadRequest);
            }
            parentPath = parentFolder.Path;
        }

        // Construct the full path
        // Basic path construction, consider sanitization/validation for production
        var newPath = string.IsNullOrWhiteSpace(parentPath)
            ? createDto.Name
            : $"{parentPath}/{createDto.Name}";

        var newFolder = new Folder
        {
            Id = Guid.NewGuid(),
            Name = createDto.Name,
            ParentId = createDto.ParentId,
            Path = newPath, // Store the calculated path
            CreatedAt = DateTimeOffset.UtcNow,
            ModifiedAt = DateTimeOffset.UtcNow
        };

        try
        {
            db.Folders.Add(newFolder);
            await db.SaveChangesAsync();
            logger.LogInformation("Created new Folder with ID: {FolderId}, Path: {FolderPath}", newFolder.Id, newFolder.Path);
            return TypedResults.Created($"/api/folders/{newFolder.Id}", newFolder);
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Failed to save new Folder '{FolderName}' to database.", createDto.Name);
            return TypedResults.Problem("Failed to save folder information.", statusCode: StatusCodes.Status500InternalServerError);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred while creating Folder '{FolderName}'.", createDto.Name);
            return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    // PUT /{id}
    public static async Task<Results<NoContent, NotFound, ValidationProblem, ProblemHttpResult>> UpdateFolder(
        Guid id,
        [FromBody] UpdateFolderDto updateDto,
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("FoldersApi");
        var existingFolder = await db.Folders.FindAsync(id);

        if (existingFolder is null)
        {
            return TypedResults.NotFound();
        }

        // Only update Name for now
        if (existingFolder.Name != updateDto.Name)
        {
            // TODO: Implement logic to update the paths of descendant folders when a folder is renamed.
            // This should ensure that all child folders inherit the updated path structure to maintain consistency.
            // For example, if a folder's path changes from "/parent" to "/new-parent", all child folders
            // should have their paths updated accordingly (e.g., "/parent/child" -> "/new-parent/child").
            // Consider edge cases such as circular references or concurrent updates.
            logger.LogWarning("Updating folder name only for ID {FolderId}. Path update logic for descendants is deferred.", id);
            existingFolder.Name = updateDto.Name;
            existingFolder.ModifiedAt = DateTimeOffset.UtcNow;

            try
            {
                await db.SaveChangesAsync();
                logger.LogInformation("Updated Folder name for ID: {FolderId}", id);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                 logger.LogWarning(ex, "Concurrency conflict updating Folder ID {FolderId}", id);
                 return TypedResults.Problem("The record you attempted to edit was modified by another user.", statusCode: StatusCodes.Status409Conflict);
            }
            catch (DbUpdateException ex)
            {
                logger.LogError(ex, "Failed to update Folder ID {FolderId} in database.", id);
                return TypedResults.Problem("Failed to save folder information.", statusCode: StatusCodes.Status500InternalServerError);
            }
             catch (Exception ex)
            {
                logger.LogError(ex, "An unexpected error occurred while updating Folder ID {FolderId}", id);
                return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
            }
        }
        else
        {
             logger.LogInformation("No name change detected for Folder ID {FolderId}. Update skipped.", id);
        }

        return TypedResults.NoContent();
    }

    // DELETE /{id}
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> DeleteFolder(
        Guid id,
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("FoldersApi");
        var existingFolder = await db.Folders
                                     .Include(f => f.Children) // Need to check if children exist
                                     .Include(f => f.MediaItems) // Need to check if media items exist (if using Restrict)
                                     .FirstOrDefaultAsync(f => f.Id == id);

        if (existingFolder is null)
        {
            return TypedResults.NotFound();
        }

        // Check for children (based on OnDelete(DeleteBehavior.Restrict) in DbContext)
        if (existingFolder.Children.Any())
        {
             logger.LogWarning("Attempted to delete non-empty folder ID {FolderId}. Has {ChildCount} children.", id, existingFolder.Children.Count);
             return TypedResults.Problem("Cannot delete a folder that contains subfolders.", statusCode: StatusCodes.Status400BadRequest);
        }

        // Optional: Check for media items if using Restrict on MediaItems relationship
        // if (existingFolder.MediaItems.Any())
        // {
        //     logger.LogWarning("Attempted to delete folder ID {FolderId} containing media items.", id);
        //     return TypedResults.Problem("Cannot delete a folder that contains media items.", statusCode: StatusCodes.Status400BadRequest);
        // }

        try
        {
            db.Folders.Remove(existingFolder);
            await db.SaveChangesAsync();
            logger.LogInformation("Deleted Folder with ID: {FolderId}", id);
            return TypedResults.NoContent();
        }
         catch (DbUpdateConcurrencyException ex)
        {
            logger.LogWarning(ex, "Concurrency conflict deleting Folder ID {FolderId}", id);
            return TypedResults.Problem("The record you attempted to delete was modified by another user.", statusCode: StatusCodes.Status409Conflict);
        }
        catch (DbUpdateException ex) // Catches potential FK constraint issues if not handled above
        {
            logger.LogError(ex, "Failed to delete Folder ID {FolderId} from database.", id);
            return TypedResults.Problem("Failed to delete folder information. Ensure it is empty.", statusCode: StatusCodes.Status500InternalServerError);
        }
         catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred while deleting Folder ID {FolderId}", id);
            return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    // --- Additional Folder Endpoints ---

    // GET /tree
    public static async Task<Ok<List<FolderTreeNodeDto>>> GetFolderTree(AppDbContext db)
    {
        // Fetch all folders efficiently
        var allFolders = await db.Folders
                                 .AsNoTracking()
                                 .OrderBy(f => f.Path) // Order by path helps in building tree
                                 .ToListAsync();

        // Build the tree structure
        var tree = new List<FolderTreeNodeDto>();
        var lookup = new Dictionary<Guid, FolderTreeNodeDto>();

        foreach (var folder in allFolders)
        {
            var node = new FolderTreeNodeDto
            {
                Id = folder.Id,
                Name = folder.Name,
                Path = folder.Path,
                ParentId = folder.ParentId
            };
            lookup[folder.Id] = node;

            if (folder.ParentId.HasValue && lookup.TryGetValue(folder.ParentId.Value, out var parentNode))
            {
                parentNode.Children.Add(node);
            }
            else
            {
                // Assume it's a root node if parent not found or ParentId is null
                tree.Add(node);
            }
        }

        return TypedResults.Ok(tree);
    }

     // GET /{id}/contents
    public static async Task<Results<Ok<List<MediaItem>>, NotFound>> GetFolderContents(Guid id, AppDbContext db)
    {
        // Check if folder exists first
        var folderExists = await db.Folders.AnyAsync(f => f.Id == id);
        if (!folderExists)
        {
            return TypedResults.NotFound();
        }

        // Retrieve media items belonging to this folder
        var mediaItems = await db.MediaItems
                                 .Where(m => m.FolderId == id)
                                 .AsNoTracking()
                                 .ToListAsync();

        return TypedResults.Ok(mediaItems);
    }
}