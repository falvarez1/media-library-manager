using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Domain.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories;

public class MediaRepository : RepositoryBase<MediaItem>, IMediaRepository
{
    public MediaRepository(AppDbContext context) : base(context)
    {
    }

    // Media-specific query methods
    public async Task<IQueryable<MediaItem>> GetByFolderAsync(Guid? folderId, bool includeSubfolders = false)
    {
        if (!includeSubfolders)
        {
            return _dbSet.Where(m => m.FolderId == folderId);
        }

        // Get all descendant folder IDs
        var folderIds = new List<Guid>();
        if (folderId.HasValue)
        {
            folderIds.Add(folderId.Value);
            await AddDescendantFolderIds(folderId.Value, folderIds);
        }

        return _dbSet.Where(m => m.FolderId.HasValue && folderIds.Contains(m.FolderId.Value));
    }

    public async Task<IQueryable<MediaItem>> GetByCollectionAsync(Guid collectionId)
    {
        // This will need to be updated when we implement proper many-to-many relationships
        var collection = await _context.Collections
            .Include(c => c.MediaItems)
            .FirstOrDefaultAsync(c => c.Id == collectionId);

        if (collection == null || collection.MediaItems == null)
        {
            return _dbSet.Where(m => false); // Return empty query
        }

        var mediaIds = collection.MediaItems.Select(i => i.Id).ToList();
        return _dbSet.Where(m => mediaIds.Contains(m.Id));
    }

    public async Task<IQueryable<MediaItem>> GetByTagsAsync(IEnumerable<string> tags, bool matchAll = false)
    {
        var tagList = tags.ToList();
        
        if (!tagList.Any())
        {
            return _dbSet;
        }

        // TODO: This needs to be rewritten when we implement proper many-to-many tag relationships
        // For now, using JSON string contains (not efficient)
        IQueryable<MediaItem> query = _dbSet;

        if (matchAll)
        {
            // Match all tags
            foreach (var tag in tagList)
            {
                query = query.Where(m => m.Tags != null && m.Tags.Contains($"\"{tag}\""));
            }
        }
        else
        {
            // Match any tag
            query = query.Where(m => m.Tags != null && tagList.Any(tag => m.Tags.Contains($"\"{tag}\"")));
        }

        return await Task.FromResult(query);
    }

    public async Task<IQueryable<MediaItem>> GetByStatusAsync(string status)
    {
        return await Task.FromResult(_dbSet.Where(m => m.Status == status));
    }

    public async Task<IQueryable<MediaItem>> SearchAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return _dbSet;
        }

        var lowerSearchTerm = searchTerm.ToLower();
        
        return await Task.FromResult(_dbSet.Where(m => 
            m.Name.ToLower().Contains(lowerSearchTerm) ||
            (m.Path != null && m.Path.ToLower().Contains(lowerSearchTerm)) ||
            (m.Tags != null && m.Tags.ToLower().Contains(lowerSearchTerm)) ||
            (m.AiTags != null && m.AiTags.ToLower().Contains(lowerSearchTerm))
        ));
    }

    // Statistics
    public async Task<Dictionary<string, int>> GetCountByTypeAsync()
    {
        return await _dbSet
            .GroupBy(m => m.Type ?? "unknown")
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Type, x => x.Count);
    }

    public async Task<Dictionary<string, long>> GetSizeByTypeAsync()
    {
        return await _dbSet
            .GroupBy(m => m.Type ?? "unknown")
            .Select(g => new { Type = g.Key, Size = g.Sum(m => m.SizeInBytes) })
            .ToDictionaryAsync(x => x.Type, x => x.Size);
    }

    public async Task<long> GetTotalSizeAsync()
    {
        return await _dbSet.SumAsync(m => m.SizeInBytes);
    }

    // Batch operations
    public async Task<int> UpdateBatchAsync(IEnumerable<Guid> ids, Action<MediaItem> updateAction)
    {
        var items = await _dbSet.Where(m => ids.Contains(m.Id)).ToListAsync();
        
        foreach (var item in items)
        {
            updateAction(item);
            item.ModifiedAt = DateTimeOffset.UtcNow;
        }

        return await _context.SaveChangesAsync();
    }

    public async Task<int> DeleteBatchAsync(IEnumerable<Guid> ids)
    {
        var items = await _dbSet.Where(m => ids.Contains(m.Id)).ToListAsync();
        _dbSet.RemoveRange(items);
        return await _context.SaveChangesAsync();
    }

    // Helper methods
    private async Task AddDescendantFolderIds(Guid parentId, List<Guid> folderIds)
    {
        var childFolders = await _context.Folders
            .Where(f => f.ParentId == parentId)
            .Select(f => f.Id)
            .ToListAsync();

        folderIds.AddRange(childFolders);

        foreach (var childId in childFolders)
        {
            await AddDescendantFolderIds(childId, folderIds);
        }
    }
}