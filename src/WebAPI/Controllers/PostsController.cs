using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceEcommerce.Application.DTOs.Blog;
using SourceEcommerce.Application.Services;
using SourceEcommerce.Domain.Enums;
using System.Security.Claims;

namespace SourceEcommerce.API.Controllers;

/// <summary>
/// Public blog endpoints (read) + Admin content management.
/// </summary>
public class PostsController(BlogService blogService) : BaseApiController
{
    // Public Endpoints

    /// <summary>Get paginated list of published posts.</summary>
    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] PostQueryParams query, CancellationToken ct)
        => Ok(await blogService.GetListAsync(query, adminMode: false, ct));

    /// <summary>Get published post by slug. Also increments view count.</summary>
    [HttpGet("{slug}", Name = "GetPostBySlug")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var post = await blogService.GetBySlugAsync(slug, ct);
        if (post == null) return NotFound();

        // Fire-and-forget view increment (don't slow down the response)
        _ = blogService.IncrementViewAsync(slug, CancellationToken.None);
        return Ok(post);
    }

    /// <summary>Get all blog categories with post counts.</summary>
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
        => Ok(await blogService.GetCategoriesAsync(ct));

    // Admin Endpoints

    /// <summary>Get all posts regardless of status (admin view). [Admin only]</summary>
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetListAdmin([FromQuery] PostQueryParams query, CancellationToken ct)
        => Ok(await blogService.GetListAsync(query, adminMode: true, ct));

    /// <summary>Get any post by ID including draft/archived. [Admin only]</summary>
    [HttpGet("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByIdAdmin(Guid id, CancellationToken ct)
        => OkOrNotFound(await blogService.GetByIdAsync(id, ct));

    /// <summary>Create a new blog post. [Admin only]</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePostRequest req, CancellationToken ct)
    {
        var result = await blogService.CreateAsync(req, CurrentUserId, ct);
        return CreatedAtRoute("GetPostBySlug", new { slug = result.Slug }, result);
    }

    /// <summary>Update a post's fields. [Admin only]</summary>
    [HttpPatch("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePostRequest req, CancellationToken ct)
        => OkOrNotFound(await blogService.UpdateAsync(id, req, ct));

    /// <summary>Soft-delete (archive) a post. [Admin only]</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var success = await blogService.DeleteAsync(id, ct);
        return success ? NoContent() : NotFound();
    }

    /// <summary>
    /// Upload a media file (image, video, or any file) directly into a post's media library.
    /// The object key is returned so the editor can embed it in ContentJson. [Admin only]
    /// </summary>
    [HttpPost("{id:guid}/media")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadMedia(
        Guid id,
        IFormFile file,
        [FromForm] PostMediaType mediaType,
        CancellationToken ct)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty.");

        const long MaxBytes = 200L * 1024 * 1024; // 200 MB
        if (file.Length > MaxBytes) return BadRequest("File exceeds 200 MB limit.");

        await using var stream = file.OpenReadStream();
        var result = await blogService.UploadMediaAsync(id, stream, file.FileName, file.ContentType, mediaType, ct);
        return Ok(result);
    }

    /// <summary>Delete a media file from a post. [Admin only]</summary>
    [HttpDelete("{id:guid}/media/{mediaId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteMedia(Guid id, Guid mediaId, CancellationToken ct)
    {
        var success = await blogService.DeleteMediaAsync(id, mediaId, ct);
        return success ? NoContent() : NotFound();
    }

    // Blog Category Management

    /// <summary>Create a new blog category. [Admin only]</summary>
    [HttpPost("categories")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCategory([FromBody] BlogCategoryRequest req, CancellationToken ct)
        => Ok(await blogService.CreateCategoryAsync(req, ct));

    /// <summary>Update a blog category. [Admin only]</summary>
    [HttpPatch("categories/{categoryId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCategory(Guid categoryId, [FromBody] BlogCategoryRequest req, CancellationToken ct)
        => OkOrNotFound(await blogService.UpdateCategoryAsync(categoryId, req, ct));

    /// <summary>Delete a blog category. [Admin only]</summary>
    [HttpDelete("categories/{categoryId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(Guid categoryId, CancellationToken ct)
    {
        var success = await blogService.DeleteCategoryAsync(categoryId, ct);
        return success ? NoContent() : NotFound();
    }

}
