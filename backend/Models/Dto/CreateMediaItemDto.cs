using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

public class CreateMediaItemDto
{
    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty; // Usually derived from uploaded filename

    public Guid? FolderId { get; set; }

    [Required]
    [MaxLength(1024)]
    public string Path { get; set; } = string.Empty; // Logical path

    // Optional fields that might be provided during upload
    public List<string>? Tags { get; set; }
    public List<string>? UsedIn { get; set; }
    public bool IsStarred { get; set; }
    public bool IsFavorited { get; set; }
    public string? Status { get; set; } // Might default on server

    // Note: File content will be handled separately via IFormFile
}