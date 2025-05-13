using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class MediaItem
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid(); // Primary Key

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // e.g., "image", "video", "document"

    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty; // Original filename

    public Guid? FolderId { get; set; } // Foreign key to Folder (nullable if root)
    [ForeignKey("FolderId")]
    public virtual Folder? Folder { get; set; }

    [Required]
    [MaxLength(1024)]
    public string Path { get; set; } = string.Empty; // Logical path within the library

    [Required]
    [MaxLength(2048)]
    public string PhysicalPath { get; set; } = string.Empty; // Actual path in storage (e.g., file system)

    public long SizeInBytes { get; set; }

    [MaxLength(50)]
    public string? Dimensions { get; set; } // e.g., "1920x1080" or "Vector"

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset ModifiedAt { get; set; } = DateTimeOffset.UtcNow;

    public bool IsUsed { get; set; } // Renamed from 'used'

    [Column(TypeName = "jsonb")] // Or "nvarchar(max)" for SQL Server JSON
    public string? UsedIn { get; set; } // Store as JSON array string: ["Context1", "Context2"]

    [Column(TypeName = "jsonb")] // Or "nvarchar(max)" for SQL Server JSON
    public string? Tags { get; set; } // Store as JSON array string: ["tag1", "tag2"]

    [Column(TypeName = "jsonb")] // Or "nvarchar(max)" for SQL Server JSON
    public string? AiTags { get; set; } // Store as JSON array string

    public bool IsStarred { get; set; } // Renamed from 'starred'

    public bool IsFavorited { get; set; } // Renamed from 'favorited'

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "in_review"; // e.g., "approved", "in_review", "rejected"

    [Column(TypeName = "jsonb")] // Or "nvarchar(max)" for SQL Server JSON
    public string? Attribution { get; set; } // Store as JSON object string

    [Column(TypeName = "jsonb")] // Or "nvarchar(max)" for SQL Server JSON
    public string? Metadata { get; set; } // Store as JSON object string (structure varies by type)

    public double? DurationSeconds { get; set; } // For video/audio

    [MaxLength(500)]
    public string? RejectionReason { get; set; } // Only if status is 'rejected'

    // Timestamps for EF Core concurrency checking (optional but good practice)
    // [Timestamp]
    // public byte[] RowVersion { get; set; }

    // Navigation property for many-to-many relationship with Tag
    public virtual ICollection<Tag> AssociatedTags { get; set; } = new List<Tag>();

    // Navigation property for many-to-many relationship with Collection
    public virtual ICollection<Collection> Collections { get; set; } = new List<Collection>();
}