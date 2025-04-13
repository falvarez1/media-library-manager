using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

public class CreateCollectionDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }
}