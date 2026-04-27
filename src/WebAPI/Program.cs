using Microsoft.AspNetCore.HttpOverrides;
using SourceEcommerce.API.Extensions;
using SourceEcommerce.Application;
using SourceEcommerce.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// builder.Configuration.AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true);

// Infrastructure (EF Core + PostgreSQL + Repository + R2)
builder.Services.AddInfrastructure(builder.Configuration);

// Application (Services, business logic)
builder.Services.AddApplication();

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Authentication (Custom JWT)
builder.Services.AddCustomJwtAuth(builder.Configuration);

// Forwarded Headers (for reverse proxy/Cloudflare Tunnel)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// OpenAPI (built-in .NET 10)
builder.Services.AddOpenApiWithAuth();

// CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("NextJsClient", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetValue<string>("AllowedOrigins:NextJs") ?? "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<SourceEcommerce.Infrastructure.Persistence.AppDbContext>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();  // serves /openapi/v1.json
}

app.UseForwardedHeaders();
app.UseHttpsRedirection();
app.UseCors("NextJsClient");

// Auth pipeline (order matters)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
