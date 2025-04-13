using backend.Api;
using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer; // Added JWT Bearer namespace
using Microsoft.AspNetCore.Identity; // Added Identity namespace
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; // Added Token Validation namespace
using System.Text; // Added Encoding namespace
var builder = WebApplication.CreateBuilder(args);

// --- Service Configuration ---

// CORS Policy
const string AllowFrontendPolicy = "_allowFrontendPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowFrontendPolicy,
                      policy  =>
                      {
                          // TODO: Make origin configurable for production
                          policy.WithOrigins("http://localhost:3000")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

// Database Context (SQLite)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=medialibrary.db";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// File Storage Service (using local file system)
builder.Services.AddSingleton<IFileStorageService, FileSystemStorageService>();

// --- Identity & Authentication Configuration ---
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
    {
        // Configure password settings if needed (example)
        options.Password.RequireDigit = false;
        options.Password.RequiredLength = 6;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireLowercase = false;
        options.User.RequireUniqueEmail = true; // Recommended
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders(); // Needed for password reset, email confirmation tokens

// JWT Authentication
// TODO: Move JWT settings (Key, Issuer, Audience) to appsettings.json
var jwtKey = builder.Configuration["Jwt:Key"] ?? "YOUR_DEFAULT_SUPER_SECRET_KEY_REPLACE_THIS"; // Replace with strong key from config
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MediaLibraryIssuer";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MediaLibraryAudience";

if (jwtKey == "YOUR_DEFAULT_SUPER_SECRET_KEY_REPLACE_THIS")
{
    // Log a warning if the default key is used in development
    if (builder.Environment.IsDevelopment()) {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("Warning: Using default JWT Key. Replace 'Jwt:Key' in configuration for production.");
        Console.ResetColor();
    } else {
         // Throw an error if default key is used outside development
         throw new InvalidOperationException("JWT Key must be configured for production environments.");
    }
}


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true, // Ensure token hasn't expired
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Authorization (basic setup, policies can be added later)
builder.Services.AddAuthorization();

// TODO: Add other services (e.g., Logging, Custom Services)

var app = builder.Build();

// --- HTTP Request Pipeline Configuration ---

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // Serves Swagger UI at /swagger
}

app.UseHttpsRedirection();

app.UseCors(AllowFrontendPolicy);

// --- Authentication & Authorization Middleware ---
app.UseAuthentication(); // Must come before UseAuthorization
app.UseAuthorization();

// --- API Endpoints ---
// Map the API endpoints defined in separate classes
app.MapGroup("/api/media")
   .MapMediaApi()
   .WithTags("Media");

app.MapGroup("/api/folders")
   .MapFoldersApi() // Use the extension method from FoldersApi
   .WithTags("Folders");

app.MapGroup("/api/tags")
   .MapTagsApi() // Use the extension method from TagsApi
   .WithTags("Tags");

app.MapGroup("/api/collections")
   .MapCollectionsApi() // Use the extension method from CollectionsApi
   .WithTags("Collections");

app.MapGroup("/api/auth")
   .MapAuthApi() // Use the extension method from AuthApi
   .WithTags("Authentication");

app.MapGroup("/api/users")
   .MapUsersApi() // Use the extension method from UsersApi
   .RequireAuthorization() // Secure all user endpoints by default
   .WithTags("Users"); // Group endpoints in Swagger UI

app.Run();
