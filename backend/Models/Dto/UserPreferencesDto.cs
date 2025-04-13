namespace backend.Models.Dto;

// Example DTO for user preferences
public class UserPreferencesDto
{
    public string DefaultViewMode { get; set; } = "grid"; // e.g., "grid", "list"
    public int ItemsPerPage { get; set; } = 20;
    public bool ShowAiTags { get; set; } = true;
    // Add other preferences as needed
}