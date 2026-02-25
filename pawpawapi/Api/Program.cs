using Application.Interfaces;
using Application.Mappings;
using Application.Services;
using Core.Interfaces;
using Dapper;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Drawing;
using System.Reflection;
using System.Text;
using Quartz;
using Api.Extensions;

// Configure System.Drawing for barcode generation
System.Drawing.Imaging.ImageFormat.Png.ToString(); // Force initialization

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
var builder = WebApplication.CreateBuilder(args);

// Add HttpContextAccessor for accessing current user in services
builder.Services.AddHttpContextAccessor();

// Dependency Injection setup
builder.Services.AddScoped<Infrastructure.Data.DapperDbContext>();

// Register Repositories
builder.Services.AddRepositories();

// Register Services
builder.Services.AddApplicationServices();

// Register AutoMapper Mappings
builder.Services.AddApplicationMappings();

// Register Seeders
builder.Services.AddSeeders();

// Add controllers
builder.Services.AddControllers();

// File upload service (uses FileUpload:UploadPath; creates "uploads" folder there)
builder.Services.AddScoped<Api.Services.IFileUploadService, Api.Services.FileUploadService>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "PawPaw API", Version = "v1" });

    // Add JWT Bearer
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });

    // Set the comments path for the Swagger JSON and UI.
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);

    // Add file upload field to multipart/form-data schema so Swagger UI shows a file input
    c.OperationFilter<Api.Swagger.CompanyFileUploadOperationFilter>();
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "YourSuperSecretKeyHere";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "PawPawApi";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };

    // Configure SignalR to use JWT tokens from query string or header
    options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var path = context.HttpContext.Request.Path;
            if (path.StartsWithSegments("/notificationHub"))
            {
                // Try to get token from query string (for WebSocket connections)
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken))
                {
                    context.Token = accessToken;
                }
                // If not in query string, the Authorization header will be used automatically
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    // Add more policies as needed
});

// Configure Quartz for background job scheduling
builder.Services.AddQuartzJobs(builder.Configuration);

// Add CORS configuration for SignalR and API - Allow all origins for all environments
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Allow all origins, ports, and environments
        policy.SetIsOriginAllowed(_ => true) // Allow any origin (localhost with any port, production domains, etc.)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR with authentication
    });
});

// Add SignalR for real-time notifications (works in dev and production)
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
});

var app = builder.Build();
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (connectionString != null)
{
    //await XMP.Dms.Infrastructure.DbScripts.MigrationRunner.RunMigrationsAsync(connectionString);
    await MigrationRunner.RunMigrationsAsync(connectionString);
}
// Run all seeders
await app.RunSeedersAsync();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS first - required for SignalR negotiate and WebSocket (dev + production)
app.UseCors("AllowFrontend");

// Serve static files from the uploads folder (path from FileUpload:UploadPath or ContentRootPath)
var uploadBasePath = builder.Configuration["FileUpload:UploadPath"];
if (string.IsNullOrWhiteSpace(uploadBasePath))
    uploadBasePath = builder.Environment.ContentRootPath;
var uploadsPath = Path.Combine(uploadBasePath, "uploads");
if (!Directory.Exists(uploadsPath))
    Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/Uploads"
});

app.UseMiddleware<Api.ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR Hub (explicit CORS ensures /notificationHub works in production)
app.MapHub<Api.Hubs.NotificationHub>("/notificationHub")
   .RequireCors("AllowFrontend");

app.Run();
