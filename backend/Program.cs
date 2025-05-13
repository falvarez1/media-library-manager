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
                          var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>();
                          if (corsOrigins != null && corsOrigins.Length > 0)
                          {
                              policy.WithOrigins(corsOrigins)
                                    .AllowAnyHeader()
                                    .AllowAnyMethod();
                          }
                          else
                          {
                              // Fallback or default if not configured - for development
                              if (builder.Environment.IsDevelopment()) {
                                policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
                                      .AllowAnyHeader()
                                      .AllowAnyMethod();
                              }
                              // In production, you might want to throw an error or have a stricter default
                          }
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
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
{
    throw new InvalidOperationException("JWT Key, Issuer, and Audience must be configured in appsettings.json.");
}

// It's crucial that the JWT Key is strong and kept secret, especially for production.
// The default key in appsettings.Development.json is for development ONLY.
if (jwtKey == "REPLACE_THIS_WITH_A_VERY_STRONG_AND_SECRET_KEY_32_CHARS_LONG_OR_MORE" && !builder.Environment.IsDevelopment())
{
    throw new InvalidOperationException("Default JWT Key is being used in a non-development environment. Please configure a strong, unique JWT:Key in appsettings.json for production.");
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
