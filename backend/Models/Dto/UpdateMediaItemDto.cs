using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

// DTO for updating existing MediaItem metadata
// Only includes fields that are typically updatable
public class UpdateMediaItemDto
{
    // Fields that might be updatable:
    [MaxLength(255)]
    public string? Name { get; set; } // Allow renaming

    public Guid? FolderId { get; set; } // Allow moving

    [MaxLength(1024)]
    public string? Path { get; set; } // Allow changing logical path

    public bool? IsUsed { get; set; }

    public List<string>? UsedIn { get; set; } // Allow updating usage context

    public List<string>? Tags { get; set; } // Allow updating tags

    public bool? IsStarred { get; set; }

    public bool? IsFavorited { get; set; }

    [MaxLength(50)]
    public string? Status { get; set; } // Allow changing status (e.g., approve, reject)

    public string? Attribution { get; set; } // Allow updating attribution (as JSON string)

    public string? Metadata { get; set; } // Allow updating metadata (as JSON string)

    [MaxLength(500)]
    public string? RejectionReason { get; set; } // Allow adding/changing rejection reason

    // Note: Type, Size, Dimensions, PhysicalPath, CreatedAt are generally not updated via this endpoint.
    // AiTags are likely generated/updated by a separate process.
}