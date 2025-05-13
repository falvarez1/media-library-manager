namespace backend.Models.Dto;

// DTO for returning basic user profile info
public class UserProfileDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    // Add other profile fields as needed (e.g., FirstName, LastName)
}