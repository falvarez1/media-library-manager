namespace backend.Models.Dto;

public class LoginResponseDto
{
    public bool Success { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? Message { get; set; } // Optional message (e.g., "Login successful")
}