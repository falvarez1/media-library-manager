using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

public class ModifyCollectionItemsDto
{
    [Required]
    [MinLength(1)]
    public List<Guid> MediaItemIds { get; set; } = new List<Guid>();
}