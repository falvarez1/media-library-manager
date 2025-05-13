using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

public class LoginDto
{
    [Required]
    // Could be Email or UserName depending on login logic
    public string LoginIdentifier { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;
}