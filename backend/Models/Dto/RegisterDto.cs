using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

public class RegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Password)]
    // Add complexity requirements if needed via attributes or fluent validation
    public string Password { get; set; } = string.Empty;

    // Optional: Add other fields like UserName, FirstName, LastName if needed
    [Required]
    public string UserName { get; set; } = string.Empty; // Often same as Email or separate
}