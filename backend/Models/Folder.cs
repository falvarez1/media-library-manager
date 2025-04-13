using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Folder
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    // Foreign key for parent folder (nullable for root folders)
    public Guid? ParentId { get; set; }

    // Navigation property for the parent folder
    [ForeignKey("ParentId")]
    public virtual Folder? Parent { get; set; }

    // Navigation property for child folders
    public virtual ICollection<Folder> Children { get; set; } = new List<Folder>();

    // Navigation property for media items within this folder
    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();

    // Store the full logical path for easier querying/display, e.g., "Documents/Reports"
    [Required]
    [MaxLength(1024)]
    public string Path { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset ModifiedAt { get; set; } = DateTimeOffset.UtcNow;
}