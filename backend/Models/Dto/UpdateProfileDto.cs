using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dto;

// DTO for updating user profile
public class UpdateProfileDto
{
    // Allow updating UserName, maybe Email later (requires confirmation flow)
    [Required]
    [MaxLength(256)] // Match IdentityUser default
    public string UserName { get; set; } = string.Empty;

    // Add other updatable profile fields here
}