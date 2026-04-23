using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceEcommerce.Domain.Interfaces;

namespace SourceEcommerce.API.Controllers;

[Authorize(Roles = "Admin")]
public class FilesController(IStorageService storageService) : BaseApiController
{
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is empty or not provided.");
        }

        // Limit to 5MB for images
        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest("File size exceeds 5MB limit.");
        }

        // Basic image validation
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".png" && ext != ".jpg" && ext != ".jpeg" && ext != ".webp" && ext != ".gif")
        {
            return BadRequest("Only image files are allowed for temporary upload.");
        }

        // Upload to temp/ prefix
        await using var stream = file.OpenReadStream();
        var objectKey = await storageService.UploadAsync(
            stream, 
            file.FileName, 
            file.ContentType, 
            isPublic: true, 
            prefix: "temp/", 
            ct);

        return Ok(new
        {
            Url = objectKey, // Return objectKey (not full URL) so Frontend can pass it back
            FullUrl = storageService.GetPublicUrl(objectKey), // For previewing in UI
            FileName = file.FileName,
            FileSize = file.Length
        });
    }
}
