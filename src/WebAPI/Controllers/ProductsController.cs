using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using SourceEcommerce.Application.DTOs.Product;
using SourceEcommerce.Application.Services;

namespace SourceEcommerce.API.Controllers;

/// <summary>
/// Public product catalog endpoints + Admin product management.
/// </summary>
public class ProductsController(ProductService productService) : BaseApiController
{
    // Public Endpoints

    /// <summary>Get paginated product list with filters.</summary>
    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] ProductQueryParams query, CancellationToken ct)
        => Ok(await productService.GetListAsync(query, ct));

    /// <summary>Get full product detail by slug.</summary>
    [HttpGet("{slug}", Name = "GetProductBySlug")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
        => OkOrNotFound(await productService.GetBySlugAsync(slug, ct));

    // Admin Endpoints

    /// <summary>Create a new product. [Admin only]</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest req, CancellationToken ct)
    {
        var result = await productService.CreateAsync(req, ct);
        return CreatedAtRoute("GetProductBySlug", new { slug = result.Slug }, result);
    }

    /// <summary>Update product fields. [Admin only]</summary>
    [HttpPatch("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest req, CancellationToken ct)
        => OkOrNotFound(await productService.UpdateAsync(id, req, ct));

    /// <summary>Soft-delete (deactivate) a product. [Admin only]</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var success = await productService.DeleteAsync(id, ct);
        return success ? NoContent() : NotFound();
    }

    /// <summary>Upload a file (image, video, or archive) to a product. [Admin only]</summary>
    [HttpPost("{id:guid}/files")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadFile(Guid id, IFormFile file, [FromForm] SourceEcommerce.Domain.Enums.FileType fileType, [FromForm] bool isPreview, CancellationToken ct)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty");

        using var stream = file.OpenReadStream();
        var result = await productService.UploadFileAsync(id, stream, file.FileName, file.ContentType, fileType, isPreview, ct);
        return Ok(result);
    }

    /// <summary>Get product by ID (admin view, includes inactive). [Admin only]</summary>
    [HttpGet("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByIdAdmin(Guid id, CancellationToken ct)
        => OkOrNotFound(await productService.GetByIdAsync(id, ct));
}
