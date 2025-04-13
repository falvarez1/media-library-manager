using backend.Data;
using backend.Models;
using backend.Models.Dto;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api;

public static class CollectionsApi
{
    public static RouteGroupBuilder MapCollectionsApi(this RouteGroupBuilder group)
    {
        // GET /api/collections
        group.MapGet("/", GetAllCollections)
             .WithName("GetCollections")
             .Produces<Ok<List<Collection>>>();

        // GET /api/collections/{id}
        group.MapGet("/{id:guid}", GetCollectionById)
             .WithName("GetCollectionById")
             .Produces<Ok<Collection>>() // Consider a DTO response?
             .Produces<NotFound>();

        // GET /api/collections/{id}/contents - Get media items in a collection
        group.MapGet("/{id:guid}/contents", GetCollectionContents)
             .WithName("GetCollectionContents")
             .Produces<Ok<List<MediaItem>>>() // Consider a DTO response?
             .Produces<NotFound>();

        // POST /api/collections
        group.MapPost("/", CreateCollection)
             .WithName("CreateCollection")
             .Accepts<CreateCollectionDto>("application/json")
             .Produces<Created<Collection>>(StatusCodes.Status201Created)
             .ProducesValidationProblem()
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // PUT /api/collections/{id}
        group.MapPut("/{id:guid}", UpdateCollection)
             .WithName("UpdateCollection")
             .Accepts<UpdateCollectionDto>("application/json")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<NotFound>()
             .ProducesValidationProblem()
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // DELETE /api/collections/{id}
        group.MapDelete("/{id:guid}", DeleteCollection)
             .WithName("DeleteCollection")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<NotFound>()
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // POST /api/collections/{id}/add-items
        group.MapPost("/{id:guid}/add-items", AddItemsToCollection)
             .WithName("AddItemsToCollection")
             .Accepts<ModifyCollectionItemsDto>("application/json")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<NotFound>() // Collection or MediaItem not found
             .ProducesValidationProblem()
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // POST /api/collections/{id}/remove-items
        group.MapPost("/{id:guid}/remove-items", RemoveItemsFromCollection)
             .WithName("RemoveItemsFromCollection")
             .Accepts<ModifyCollectionItemsDto>("application/json")
             .Produces(StatusCodes.Status204NoContent)
             .Produces<NotFound>() // Collection not found
             .ProducesValidationProblem()
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // TODO: Add endpoint for sharing collections

        return group;
    }

    // --- Handler Implementations ---

    // GET /
    public static async Task<Ok<List<Collection>>> GetAllCollections(AppDbContext db)
    {
        // Decide if MediaItems should be included by default
        var collections = await db.Collections.AsNoTracking().OrderBy(c => c.Name).ToListAsync();
        return TypedResults.Ok(collections);
    }

    // GET /{id}
    public static async Task<Results<Ok<Collection>, NotFound>> GetCollectionById(Guid id, AppDbContext db)
    {
        // Include MediaItems? Depends on frontend needs for viewing a single collection
        var collection = await db.Collections
                                 // .Include(c => c.MediaItems) // Eager load items if needed
                                 .AsNoTracking()
                                 .FirstOrDefaultAsync(c => c.Id == id);

        return collection is Collection foundCollection
            ? TypedResults.Ok(foundCollection)
            : TypedResults.NotFound();
    }

     // GET /{id}/contents
    public static async Task<Results<Ok<List<MediaItem>>, NotFound>> GetCollectionContents(Guid id, AppDbContext db)
    {
        var collection = await db.Collections
                                 .Include(c => c.MediaItems) // MUST Include MediaItems here
                                 .AsNoTracking()
                                 .FirstOrDefaultAsync(c => c.Id == id);

        if (collection is null)
        {
            return TypedResults.NotFound();
        }

        // TODO: Add pagination/sorting for contents if needed
        return TypedResults.Ok(collection.MediaItems.ToList());
    }


    // POST /
    public static async Task<Results<Created<Collection>, ValidationProblem, ProblemHttpResult>> CreateCollection(
        [FromBody] CreateCollectionDto createDto,
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("CollectionsApi");

        var newCollection = new Collection
        {
            Id = Guid.NewGuid(),
            Name = createDto.Name,
            Description = createDto.Description,
            CreatedAt = DateTimeOffset.UtcNow,
            ModifiedAt = DateTimeOffset.UtcNow
            // TODO: Assign UserId when auth is implemented
        };

        try
        {
            db.Collections.Add(newCollection);
            await db.SaveChangesAsync();
            logger.LogInformation("Created new Collection with ID: {CollectionId}, Name: {CollectionName}", newCollection.Id, newCollection.Name);
            return TypedResults.Created($"/api/collections/{newCollection.Id}", newCollection);
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Failed to save new Collection '{CollectionName}' to database.", createDto.Name);
            return TypedResults.Problem("Failed to save collection information.", statusCode: StatusCodes.Status500InternalServerError);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred while creating Collection '{CollectionName}'.", createDto.Name);
            return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    // PUT /{id}
    public static async Task<Results<NoContent, NotFound, ValidationProblem, ProblemHttpResult>> UpdateCollection(
        Guid id,
        [FromBody] UpdateCollectionDto updateDto,
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("CollectionsApi");
        var existingCollection = await db.Collections.FindAsync(id);

        if (existingCollection is null)
        {
            return TypedResults.NotFound();
        }

        bool changed = false;
        if (existingCollection.Name != updateDto.Name)
        {
            existingCollection.Name = updateDto.Name;
            changed = true;
        }
        // Use object.Equals for nullable string comparison
        if (!object.Equals(existingCollection.Description, updateDto.Description))
        {
            existingCollection.Description = updateDto.Description;
            changed = true;
        }

        if (changed)
        {
            existingCollection.ModifiedAt = DateTimeOffset.UtcNow;
            try
            {
                await db.SaveChangesAsync();
                logger.LogInformation("Updated Collection ID: {CollectionId}", id);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                 logger.LogWarning(ex, "Concurrency conflict updating Collection ID {CollectionId}", id);
                 return TypedResults.Problem("The record you attempted to edit was modified by another user.", statusCode: StatusCodes.Status409Conflict);
            }
            catch (DbUpdateException ex)
            {
                logger.LogError(ex, "Failed to update Collection ID {CollectionId} in database.", id);
                return TypedResults.Problem("Failed to save collection information.", statusCode: StatusCodes.Status500InternalServerError);
            }
             catch (Exception ex)
            {
                logger.LogError(ex, "An unexpected error occurred while updating Collection ID {CollectionId}", id);
                return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
            }
        }
         else
        {
             logger.LogInformation("No changes detected for Collection ID {CollectionId}. Update skipped.", id);
        }

        return TypedResults.NoContent();
    }

    // DELETE /{id}
    public static async Task<Results<NoContent, NotFound, ProblemHttpResult>> DeleteCollection(
        Guid id,
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("CollectionsApi");
        // Include MediaItems to ensure relationship is loaded if needed for cascading or checking
        var existingCollection = await db.Collections.Include(c => c.MediaItems).FirstOrDefaultAsync(c => c.Id == id);

        if (existingCollection is null)
        {
            return TypedResults.NotFound();
        }

        try
        {
            // EF Core handles removing relationships in the join table automatically due to cascade delete setup
            db.Collections.Remove(existingCollection);
            await db.SaveChangesAsync();
            logger.LogInformation("Deleted Collection with ID: {CollectionId}", id);
            return TypedResults.NoContent();
        }
         catch (DbUpdateConcurrencyException ex)
        {
            logger.LogWarning(ex, "Concurrency conflict deleting Collection ID {CollectionId}", id);
            return TypedResults.Problem("The record you attempted to delete was modified by another user.", statusCode: StatusCodes.Status409Conflict);
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Failed to delete Collection ID {CollectionId} from database.", id);
            return TypedResults.Problem("Failed to delete collection information.", statusCode: StatusCodes.Status500InternalServerError);
        }
         catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred while deleting Collection ID {CollectionId}", id);
            return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

     // POST /{id}/add-items
    public static async Task<Results<NoContent, NotFound, ValidationProblem, ProblemHttpResult>> AddItemsToCollection(
        Guid id,
        [FromBody] ModifyCollectionItemsDto dto,
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("CollectionsApi");

        // Eager load MediaItems to modify the collection
        var collection = await db.Collections.Include(c => c.MediaItems).FirstOrDefaultAsync(c => c.Id == id);
        if (collection is null)
        {
             logger.LogWarning("AddItemsToCollection failed: Collection ID {CollectionId} not found.", id);
            return TypedResults.NotFound();
        }

        // Find the media items to add
        // Important: Only add items that aren't already in the collection
        var existingItemIds = collection.MediaItems.Select(m => m.Id).ToHashSet();
        var itemsToAddIds = dto.MediaItemIds.Where(itemId => !existingItemIds.Contains(itemId)).ToList();

        if (!itemsToAddIds.Any())
        {
             logger.LogInformation("No new items to add to Collection ID {CollectionId}.", id);
             return TypedResults.NoContent(); // Nothing to add
        }

        var itemsToAdd = await db.MediaItems.Where(m => itemsToAddIds.Contains(m.Id)).ToListAsync();

        // Check if all requested IDs were found
        if (itemsToAdd.Count != itemsToAddIds.Count)
        {
            var notFoundIds = itemsToAddIds.Except(itemsToAdd.Select(i => i.Id));
            logger.LogWarning("AddItemsToCollection: Some MediaItem IDs not found: {NotFoundIds}", string.Join(", ", notFoundIds));
            // Decide how to handle: return error or just add the ones found? Let's return error for clarity.
             return TypedResults.ValidationProblem(new Dictionary<string, string[]> {
                { "MediaItemIds", new[] { $"Could not find MediaItem(s) with IDs: {string.Join(", ", notFoundIds)}" } }
            });
        }

        // Add the found items to the collection's navigation property
        foreach (var item in itemsToAdd)
        {
            collection.MediaItems.Add(item);
        }

        collection.ModifiedAt = DateTimeOffset.UtcNow; // Update modification time

        try
        {
            await db.SaveChangesAsync();
            logger.LogInformation("Added {ItemCount} items to Collection ID {CollectionId}.", itemsToAdd.Count, id);
            return TypedResults.NoContent();
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Failed to add items to Collection ID {CollectionId}.", id);
            return TypedResults.Problem("Failed to update collection items.", statusCode: StatusCodes.Status500InternalServerError);
        }
         catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred while adding items to Collection ID {CollectionId}", id);
            return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

     // POST /{id}/remove-items
    public static async Task<Results<NoContent, NotFound, ValidationProblem, ProblemHttpResult>> RemoveItemsFromCollection(
        Guid id,
        [FromBody] ModifyCollectionItemsDto dto,
        AppDbContext db,
        ILoggerFactory loggerFactory)
    {
         var logger = loggerFactory.CreateLogger("CollectionsApi");

        // Eager load MediaItems to modify the collection
        var collection = await db.Collections.Include(c => c.MediaItems).FirstOrDefaultAsync(c => c.Id == id);
        if (collection is null)
        {
             logger.LogWarning("RemoveItemsFromCollection failed: Collection ID {CollectionId} not found.", id);
            return TypedResults.NotFound();
        }

        int removedCount = 0;
        foreach (var itemIdToRemove in dto.MediaItemIds)
        {
            var itemToRemove = collection.MediaItems.FirstOrDefault(m => m.Id == itemIdToRemove);
            if (itemToRemove != null)
            {
                collection.MediaItems.Remove(itemToRemove);
                removedCount++;
            }
            else
            {
                 logger.LogWarning("Item ID {MediaItemId} requested for removal not found in Collection ID {CollectionId}.", itemIdToRemove, id);
            }
        }

        if (removedCount > 0)
        {
            collection.ModifiedAt = DateTimeOffset.UtcNow; // Update modification time
             try
            {
                await db.SaveChangesAsync();
                logger.LogInformation("Removed {ItemCount} items from Collection ID {CollectionId}.", removedCount, id);
            }
            catch (DbUpdateException ex)
            {
                logger.LogError(ex, "Failed to remove items from Collection ID {CollectionId}.", id);
                return TypedResults.Problem("Failed to update collection items.", statusCode: StatusCodes.Status500InternalServerError);
            }
             catch (Exception ex)
            {
                logger.LogError(ex, "An unexpected error occurred while removing items from Collection ID {CollectionId}", id);
                return TypedResults.Problem("An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
            }
        }
        else
        {
             logger.LogInformation("No items specified for removal were found in Collection ID {CollectionId}.", id);
        }

        return TypedResults.NoContent();
    }
}