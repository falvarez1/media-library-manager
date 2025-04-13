using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Collection
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)] // Optional description
    public string? Description { get; set; }

    // Navigation property for the many-to-many relationship with MediaItem
    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset ModifiedAt { get; set; } = DateTimeOffset.UtcNow;

    // TODO: Add UserId later when User entity is implemented
    // public Guid UserId { get; set; }
    // public virtual User User { get; set; }
}