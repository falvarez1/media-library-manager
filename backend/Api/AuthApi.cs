using backend.Models.Dto;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Api;

public static class AuthApi
{
    public static RouteGroupBuilder MapAuthApi(this RouteGroupBuilder group)
    {
        // POST /api/auth/register
        group.MapPost("/register", RegisterUser)
             .WithName("RegisterUser")
             .Accepts<RegisterDto>("application/json")
             .Produces(StatusCodes.Status200OK) // Or 201 Created if preferred
             .Produces<ValidationProblemDetails>(StatusCodes.Status400BadRequest)
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        // POST /api/auth/login
        group.MapPost("/login", LoginUser)
             .WithName("LoginUser")
             .Accepts<LoginDto>("application/json")
             .Produces<Ok<LoginResponseDto>>()
             .Produces<UnauthorizedHttpResult>(StatusCodes.Status401Unauthorized)
             .ProducesProblem(StatusCodes.Status500InternalServerError);

        return group;
    }

    // --- Handler Implementations ---

    // POST /register
    public static async Task<Results<Ok, ValidationProblem, ProblemHttpResult>> RegisterUser(
        [FromBody] RegisterDto registerDto,
        UserManager<IdentityUser> userManager, // Inject UserManager
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("AuthApi");

        var newUser = new IdentityUser
        {
            UserName = registerDto.UserName, // Use provided UserName
            Email = registerDto.Email
        };

        // Create the user with the provided password
        var result = await userManager.CreateAsync(newUser, registerDto.Password);

        if (!result.Succeeded)
        {
            // Collect errors for validation problem response
            var errors = new Dictionary<string, string[]>();
            foreach (var error in result.Errors)
            {
                // Attempt to map error codes to field names (basic example)
                string fieldName = error.Code.Contains("Password") ? nameof(RegisterDto.Password) :
                                   error.Code.Contains("Email") ? nameof(RegisterDto.Email) :
                                   error.Code.Contains("UserName") ? nameof(RegisterDto.UserName) :
                                   ""; // General error key
                 if (!errors.ContainsKey(fieldName)) errors[fieldName] = new string[0];
                 errors[fieldName] = errors[fieldName].Append(error.Description).ToArray();
            }
            logger.LogWarning("User registration failed for {Email}: {Errors}", registerDto.Email, string.Join(", ", result.Errors.Select(e => e.Description)));
            return TypedResults.ValidationProblem(errors);
        }

        // User created successfully
        logger.LogInformation("User registered successfully: {Email}", registerDto.Email);
        // Optional: Assign roles here using UserManager.AddToRoleAsync(newUser, "UserRole");
        // Optional: Send confirmation email

        // Return OK (or Created if you prefer to return user info, though often not done on register)
        return TypedResults.Ok();
    }

    // POST /login
    public static async Task<Results<Ok<LoginResponseDto>, UnauthorizedHttpResult, ProblemHttpResult>> LoginUser(
        [FromBody] LoginDto loginDto,
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager, // Inject SignInManager
        IConfiguration configuration, // Inject IConfiguration for JWT settings
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("AuthApi");

        // Find user by UserName or Email (adjust based on LoginIdentifier meaning)
        var user = await userManager.FindByNameAsync(loginDto.LoginIdentifier) ?? await userManager.FindByEmailAsync(loginDto.LoginIdentifier);

        if (user == null)
        {
            logger.LogWarning("Login failed: User not found for identifier {LoginIdentifier}", loginDto.LoginIdentifier);
            return TypedResults.Unauthorized();
        }

        // Check password using SignInManager (handles lockout checks etc.)
        var result = await signInManager.CheckPasswordSignInAsync(user, loginDto.Password, lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            logger.LogWarning("Login failed for user {UserId}: {Reason}", user.Id, result.ToString());
             if (result.IsLockedOut) {
                 logger.LogWarning("User {UserId} is locked out.", user.Id);
                 // Return a specific message or just Unauthorized
             }
             if (result.IsNotAllowed) {
                  logger.LogWarning("User {UserId} is not allowed to sign in (e.g., email not confirmed).", user.Id);
                 // Return a specific message or just Unauthorized
             }
            return TypedResults.Unauthorized();
        }

        // --- Password is valid, generate JWT ---
        logger.LogInformation("User {UserId} logged in successfully.", user.Id);

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!); // Ensure Key is not null
            var issuer = configuration["Jwt:Issuer"];
            var audience = configuration["Jwt:Audience"];

            // Define claims (add more as needed, e.g., roles)
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id), // Subject (standard claim for user ID)
                new Claim(JwtRegisteredClaimNames.Name, user.UserName!), // User name
                new Claim(JwtRegisteredClaimNames.Email, user.Email!), // Email
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unique token identifier
                // Example for adding roles if using them:
                // var roles = await userManager.GetRolesAsync(user);
                // claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1), // Token expiration (e.g., 1 hour) - make configurable?
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return TypedResults.Ok(new LoginResponseDto
            {
                Success = true,
                Token = tokenString,
                Expiration = token.ValidTo,
                UserId = user.Id,
                Email = user.Email!,
                UserName = user.UserName!,
                Message = "Login successful"
            });
        }
        catch (Exception ex)
        {
             logger.LogError(ex, "Error generating JWT for user {UserId}", user.Id);
             return TypedResults.Problem("An error occurred during login.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}