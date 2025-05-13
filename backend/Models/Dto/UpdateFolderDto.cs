using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

public class UpdateFolderDto
{
    [Required] // Name is required for update
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    // Note: Changing ParentId (moving folder) is excluded for now due to complexity
    // of updating descendant paths. This can be added later.
}