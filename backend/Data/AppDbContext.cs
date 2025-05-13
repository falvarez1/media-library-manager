using backend.Models; // Need this for Folder/Tag/etc. in OnModelCreating
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

// Inherit from IdentityDbContext using the default IdentityUser
public class AppDbContext : IdentityDbContext<IdentityUser>
{
    // Constructor remains the same
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Custom DbSets for our application entities
    public DbSet<backend.Models.MediaItem> MediaItems { get; set; } = null!;
    public DbSet<backend.Models.Folder> Folders { get; set; } = null!;
    public DbSet<backend.Models.Tag> Tags { get; set; } = null!;
    public DbSet<backend.Models.Collection> Collections { get; set; } = null!;
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Folder self-referencing relationship
        modelBuilder.Entity<backend.Models.Folder>()
            .HasOne(f => f.Parent)
            .WithMany(f => f.Children)
            .HasForeignKey(f => f.ParentId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a folder if it has children (adjust as needed)

        // Configure Folder to MediaItem relationship (One-to-Many)
        modelBuilder.Entity<backend.Models.Folder>()
            .HasMany(f => f.MediaItems)
            .WithOne(m => m.Folder)
            .HasForeignKey(m => m.FolderId)
            .OnDelete(DeleteBehavior.SetNull); // Set MediaItem.FolderId to null if folder is deleted (or Restrict/Cascade)

        // Configure implicit Many-to-Many for MediaItem <-> Tag
        // EF Core creates the join table automatically (e.g., MediaItemTag)
        // We don't need to explicitly configure it unless we want to customize the join table name or add payload data to it.
        // The navigation properties in MediaItem (AssociatedTags collection) and Tag (MediaItems collection) are sufficient.

        // Add unique constraint on Tag.Name for performance and data integrity
        modelBuilder.Entity<backend.Models.Tag>()
            .HasIndex(t => t.Name)
            .IsUnique();

        // Configure implicit Many-to-Many for MediaItem <-> Collection
        // EF Core creates the join table automatically (e.g., CollectionMediaItem)
    }
}