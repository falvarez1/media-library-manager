using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

public class CreateTagDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}