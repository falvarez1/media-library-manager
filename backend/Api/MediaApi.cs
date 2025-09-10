using backend.Application.Interfaces;
using backend.Domain.Common;
using backend.Models;
using backend.Models.Dto;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api;

/// <summary>
/// Media API using service layer pattern
/// </summary>
public static class MediaApi
{
    public static RouteGroupBuilder MapMediaApi(this RouteGroupBuilder group)
    {
        // GET /api/media/search - Advanced search with filters
        group.MapGet("/search", SearchMediaItems)
             .WithName("SearchMediaV1")
             .Produces<PaginatedResponse<MediaItem>>()
             .WithOpenApi();
        
        // GET /api/media - Get all media (deprecated, use /search instead)
        group.MapGet("/", GetAllMediaItems)
             .WithName("GetMediaV1")
             .Produces<PaginatedResponse<MediaItem>>();

        // GET /api/media/{id}
        group.MapGet("/{id:guid}", GetMediaItemById)
             .WithName("GetMediaByIdV1")
             .Produces<ApiResponse<MediaItem>>()
             .Produces<ApiResponse<MediaItem>>(404);

        // POST /api/media
        group.MapPost("/", CreateMediaItem)
             .WithName("CreateMediaV1")
             .DisableAntiforgery()
             .Accepts<IFormFile>("multipart/form-data")
             .Produces<ApiResponse<MediaItem>>(StatusCodes.Status201Created)
             .ProducesValidationProblem();

        // PUT /api/media/{id}
        group.MapPut("/{id:guid}", UpdateMediaItem)
             .WithName("UpdateMediaV1")
             .Accepts<UpdateMediaItemDto>("application/json")
             .Produces<ApiResponse<MediaItem>>()
             .Produces<ApiResponse<MediaItem>>(404);

        // DELETE /api/media/{id}
        group.MapDelete("/{id:guid}", DeleteMediaItem)
             .WithName("DeleteMediaV1")
             .Produces<ApiResponse<bool>>()
             .Produces<ApiResponse<bool>>(404);

        // PATCH /api/media/{id}/star
        group.MapPatch("/{id:guid}/star", ToggleStarMediaItem)
             .WithName("ToggleStarV1")
             .Produces<ApiResponse<MediaItem>>()
             .Produces<ApiResponse<MediaItem>>(404);

        // PATCH /api/media/{id}/favorite
        group.MapPatch("/{id:guid}/favorite", ToggleFavoriteMediaItem)
             .WithName("ToggleFavoriteV1")
             .Produces<ApiResponse<MediaItem>>()
             .Produces<ApiResponse<MediaItem>>(404);

        // GET /api/media/statistics
        group.MapGet("/statistics", GetMediaStatistics)
             .WithName("GetMediaStatisticsV1")
             .Produces<ApiResponse<MediaStatistics>>();

        // POST /api/media/batch/move
        group.MapPost("/batch/move", BatchMoveMediaItems)
             .WithName("BatchMoveV1")
             .Accepts<BatchMoveRequest>("application/json")
             .Produces<ApiResponse<BatchOperationResult>>();

        // POST /api/media/batch/copy
        group.MapPost("/batch/copy", BatchCopyMediaItems)
             .WithName("BatchCopyV1")
             .Accepts<BatchCopyRequest>("application/json")
             .Produces<ApiResponse<BatchOperationResult>>();

        // POST /api/media/batch/delete
        group.MapPost("/batch/delete", BatchDeleteMediaItems)
             .WithName("BatchDeleteV1")
             .Accepts<BatchDeleteRequest>("application/json")
             .Produces<ApiResponse<BatchOperationResult>>();

        // POST /api/media/batch/tag
        group.MapPost("/batch/tag", BatchTagMediaItems)
             .WithName("BatchTagV1")
             .Accepts<BatchTagRequest>("application/json")
             .Produces<ApiResponse<BatchOperationResult>>();

        // GET /api/media/{id}/url
        group.MapGet("/{id:guid}/url", GetMediaItemUrl)
             .WithName("GetMediaUrlV1")
             .Produces<ApiResponse<MediaUrlResponse>>()
             .Produces<ApiResponse<MediaUrlResponse>>(404);

        return group;
    }

    // Handler for GET /api/media/search - Advanced search
    private static async Task<IResult> SearchMediaItems(
        [AsParameters] MediaSearchRequest request,
        IMediaService mediaService)
    {
        var result = await mediaService.SearchAsync(request);
        return Results.Ok(result);
    }
    
    // Handler for GET /api/media - Legacy endpoint
    private static async Task<IResult> GetAllMediaItems(
        IMediaService mediaService)
    {
        // Use search with default parameters
        var request = new MediaSearchRequest { Page = 1, PageSize = 100 };
        var result = await mediaService.SearchAsync(request);
        return Results.Ok(result);
    }

    // Handler for GET /api/media/{id}
    private static async Task<IResult> GetMediaItemById(
        Guid id, 
        IMediaService mediaService)
    {
        var result = await mediaService.GetByIdAsync(id);
        return result.Success 
            ? Results.Ok(result) 
            : Results.NotFound(result);
    }

    // Handler for POST /api/media
    private static async Task<IResult> CreateMediaItem(
        IFormFile file,
        HttpRequest request,
        IMediaService mediaService)
    {
        if (file == null || file.Length == 0)
        {
            return Results.BadRequest(ApiResponse<MediaItem>.Fail("INVALID_FILE", "File is required", 400));
        }

        // Parse form data
        var form = await request.ReadFormAsync();
        var createDto = new CreateMediaItemDto
        {
            Type = form["Type"],
            Name = form["Name"],
            FolderId = form.ContainsKey("FolderId") && Guid.TryParse(form["FolderId"], out var folderId) ? folderId : null,
            Path = form["Path"],
            Tags = form.ContainsKey("Tags") ? form["Tags"].ToString().Split(',').Select(t => t.Trim()).ToList() : null,
            UsedIn = form.ContainsKey("UsedIn") ? form["UsedIn"].ToString().Split(',').Select(t => t.Trim()).ToList() : null,
            IsStarred = form.ContainsKey("IsStarred") && bool.TryParse(form["IsStarred"], out var isStarred) && isStarred,
            IsFavorited = form.ContainsKey("IsFavorited") && bool.TryParse(form["IsFavorited"], out var isFavorited) && isFavorited,
            Status = form["Status"]
        };

        var result = await mediaService.CreateAsync(createDto, file);
        
        return result.Success 
            ? Results.Created($"/api/media/{result.Data?.Id}", result)
            : Results.BadRequest(result);
    }

    // Handler for PUT /api/media/{id}
    private static async Task<IResult> UpdateMediaItem(
        Guid id,
        [FromBody] UpdateMediaItemDto updateDto,
        IMediaService mediaService)
    {
        var result = await mediaService.UpdateAsync(id, updateDto);
        return result.Success 
            ? Results.Ok(result) 
            : Results.NotFound(result);
    }

    // Handler for DELETE /api/media/{id}
    private static async Task<IResult> DeleteMediaItem(
        Guid id,
        IMediaService mediaService)
    {
        var result = await mediaService.DeleteAsync(id);
        return result.Success 
            ? Results.Ok(result) 
            : Results.NotFound(result);
    }

    // Handler for PATCH /api/media/{id}/star
    private static async Task<IResult> ToggleStarMediaItem(
        Guid id,
        IMediaService mediaService)
    {
        var result = await mediaService.ToggleStarAsync(id);
        return result.Success 
            ? Results.Ok(result) 
            : Results.NotFound(result);
    }

    // Handler for PATCH /api/media/{id}/favorite
    private static async Task<IResult> ToggleFavoriteMediaItem(
        Guid id,
        IMediaService mediaService)
    {
        var result = await mediaService.ToggleFavoriteAsync(id);
        return result.Success 
            ? Results.Ok(result) 
            : Results.NotFound(result);
    }

    // Handler for GET /api/media/statistics
    private static async Task<IResult> GetMediaStatistics(
        IMediaService mediaService)
    {
        var result = await mediaService.GetStatisticsAsync(null);
        return Results.Ok(result);
    }

    // Handler for POST /api/media/batch/move
    private static async Task<IResult> BatchMoveMediaItems(
        [FromBody] BatchMoveRequest request,
        IMediaService mediaService)
    {
        var result = await mediaService.BatchMoveAsync(request);
        return Results.Ok(result);
    }

    // Handler for POST /api/media/batch/copy
    private static async Task<IResult> BatchCopyMediaItems(
        [FromBody] BatchCopyRequest request,
        IMediaService mediaService)
    {
        var result = await mediaService.BatchCopyAsync(request);
        return Results.Ok(result);
    }

    // Handler for POST /api/media/batch/delete
    private static async Task<IResult> BatchDeleteMediaItems(
        [FromBody] BatchDeleteRequest request,
        IMediaService mediaService)
    {
        var result = await mediaService.BatchDeleteAsync(request);
        return Results.Ok(result);
    }

    // Handler for POST /api/media/batch/tag
    private static async Task<IResult> BatchTagMediaItems(
        [FromBody] BatchTagRequest request,
        IMediaService mediaService)
    {
        var result = await mediaService.BatchTagAsync(request);
        return Results.Ok(result);
    }

    // Handler for GET /api/media/{id}/url
    private static async Task<IResult> GetMediaItemUrl(
        Guid id,
        IMediaService mediaService)
    {
        var result = await mediaService.GetMediaUrlAsync(id);
        return result.Success 
            ? Results.Ok(result) 
            : Results.NotFound(result);
    }
}