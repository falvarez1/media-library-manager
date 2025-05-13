using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

public class UpdateTagDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}