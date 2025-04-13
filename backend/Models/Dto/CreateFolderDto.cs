using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

public class CreateFolderDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    // ID of the parent folder. Null if creating a root folder.
    public Guid? ParentId { get; set; }
}