using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace backend.Domain.Interfaces;

public interface IRepository<TEntity> where TEntity : class
{
    // Query operations
    Task<TEntity?> GetByIdAsync(Guid id);
    Task<TEntity?> GetByIdAsync(Guid id, params Expression<Func<TEntity, object>>[] includes);
    Task<IEnumerable<TEntity>> GetAllAsync();
    Task<IEnumerable<TEntity>> GetAllAsync(params Expression<Func<TEntity, object>>[] includes);
    IQueryable<TEntity> GetQueryable();
    IQueryable<TEntity> GetQueryable(params Expression<Func<TEntity, object>>[] includes);
    
    // Find operations
    Task<TEntity?> FindAsync(Expression<Func<TEntity, bool>> predicate);
    Task<IEnumerable<TEntity>> FindAllAsync(Expression<Func<TEntity, bool>> predicate);
    Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate);
    Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null);
    
    // Write operations
    Task<TEntity> AddAsync(TEntity entity);
    Task AddRangeAsync(IEnumerable<TEntity> entities);
    void Update(TEntity entity);
    void UpdateRange(IEnumerable<TEntity> entities);
    void Remove(TEntity entity);
    void RemoveRange(IEnumerable<TEntity> entities);
    
    // Save changes
    Task<int> SaveChangesAsync();
}

public interface IMediaRepository : IRepository<backend.Models.MediaItem>
{
    // Media-specific query methods
    Task<IQueryable<backend.Models.MediaItem>> GetByFolderAsync(Guid? folderId, bool includeSubfolders = false);
    Task<IQueryable<backend.Models.MediaItem>> GetByCollectionAsync(Guid collectionId);
    Task<IQueryable<backend.Models.MediaItem>> GetByTagsAsync(IEnumerable<string> tags, bool matchAll = false);
    Task<IQueryable<backend.Models.MediaItem>> GetByStatusAsync(string status);
    Task<IQueryable<backend.Models.MediaItem>> SearchAsync(string searchTerm);
    
    // Statistics
    Task<Dictionary<string, int>> GetCountByTypeAsync();
    Task<Dictionary<string, long>> GetSizeByTypeAsync();
    Task<long> GetTotalSizeAsync();
    
    // Batch operations
    Task<int> UpdateBatchAsync(IEnumerable<Guid> ids, Action<backend.Models.MediaItem> updateAction);
    Task<int> DeleteBatchAsync(IEnumerable<Guid> ids);
}

public interface IFolderRepository : IRepository<backend.Models.Folder>
{
    Task<backend.Models.Folder?> GetByPathAsync(string path);
    Task<IEnumerable<backend.Models.Folder>> GetChildrenAsync(Guid? parentId);
    Task<IEnumerable<backend.Models.Folder>> GetTreeAsync(Guid? rootId = null, int maxDepth = 10);
    Task<bool> HasChildrenAsync(Guid folderId);
    Task<bool> HasMediaItemsAsync(Guid folderId);
    Task<int> GetMediaCountAsync(Guid folderId, bool includeSubfolders = false);
}

public interface ICollectionRepository : IRepository<backend.Models.Collection>
{
    Task<IEnumerable<backend.Models.Collection>> GetByUserAsync(string userId);
    Task<bool> AddItemsAsync(Guid collectionId, IEnumerable<Guid> mediaIds);
    Task<bool> RemoveItemsAsync(Guid collectionId, IEnumerable<Guid> mediaIds);
    Task<int> GetItemCountAsync(Guid collectionId);
}

public interface ITagRepository : IRepository<backend.Models.Tag>
{
    Task<backend.Models.Tag?> GetByNameAsync(string name);
    Task<IEnumerable<backend.Models.Tag>> GetByNamesAsync(IEnumerable<string> names);
    Task<IEnumerable<backend.Models.Tag>> GetPopularAsync(int count = 10);
    Task<Dictionary<string, int>> GetUsageCountsAsync();
}