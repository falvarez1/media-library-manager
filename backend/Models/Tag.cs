using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Tag
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)] // Adjust max length as needed
    public string Name { get; set; } = string.Empty;

    // Navigation property for the many-to-many relationship with MediaItem
    // EF Core will handle the join table implicitly
    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();

    // Optional: Add usage count or other metadata if needed later
    // public int UsageCount { get; set; }
}