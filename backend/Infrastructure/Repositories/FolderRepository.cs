using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Domain.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories;

public class FolderRepository : RepositoryBase<Folder>, IFolderRepository
{
    public FolderRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<Folder?> GetByPathAsync(string path)
    {
        return await _dbSet.FirstOrDefaultAsync(f => f.Path == path);
    }

    public async Task<IEnumerable<Folder>> GetChildrenAsync(Guid? parentId)
    {
        return await _dbSet
            .Where(f => f.ParentId == parentId)
            .OrderBy(f => f.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Folder>> GetTreeAsync(Guid? rootId = null, int maxDepth = 10)
    {
        var folders = new List<Folder>();
        await BuildTreeRecursive(rootId, folders, 0, maxDepth);
        return folders;
    }

    public async Task<bool> HasChildrenAsync(Guid folderId)
    {
        return await _dbSet.AnyAsync(f => f.ParentId == folderId);
    }

    public async Task<bool> HasMediaItemsAsync(Guid folderId)
    {
        return await _context.MediaItems.AnyAsync(m => m.FolderId == folderId);
    }

    public async Task<int> GetMediaCountAsync(Guid folderId, bool includeSubfolders = false)
    {
        if (!includeSubfolders)
        {
            return await _context.MediaItems.CountAsync(m => m.FolderId == folderId);
        }

        // Get all descendant folder IDs
        var folderIds = new List<Guid> { folderId };
        await AddDescendantFolderIds(folderId, folderIds);

        return await _context.MediaItems
            .CountAsync(m => m.FolderId.HasValue && folderIds.Contains(m.FolderId.Value));
    }

    // Helper methods
    private async Task BuildTreeRecursive(Guid? parentId, List<Folder> folders, int currentDepth, int maxDepth)
    {
        if (currentDepth >= maxDepth)
        {
            return;
        }

        var children = await GetChildrenAsync(parentId);
        
        foreach (var child in children)
        {
            folders.Add(child);
            await BuildTreeRecursive(child.Id, folders, currentDepth + 1, maxDepth);
        }
    }

    private async Task AddDescendantFolderIds(Guid parentId, List<Guid> folderIds)
    {
        var childFolders = await _dbSet
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