using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.DTOs.Product;
using SourceEcommerce.Application.Services;
using SourceEcommerce.Domain.Entities;

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

    // Addon Management

    /// <summary>List all addons for a product. [Admin only]</summary>
    [HttpGet("{id:guid}/addons")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAddons(Guid id, [FromServices] SourceEcommerce.Application.Interfaces.IApplicationDbContext db, CancellationToken ct)
    {
        var addons = await db.ProductAddons
            .Where(a => a.ProductId == id)
            .OrderBy(a => a.CreatedAt)
            .Select(a => new ProductAddonDto(a.Id, a.Name, a.Description, a.Price, a.IsActive))
            .ToListAsync(ct);
        return Ok(addons);
    }

    /// <summary>Create an addon for a product. [Admin only]</summary>
    [HttpPost("{id:guid}/addons")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAddon(Guid id, [FromBody] CreateAddonRequest req, [FromServices] SourceEcommerce.Application.Interfaces.IApplicationDbContext db, CancellationToken ct)
    {
        var product = await db.Products.FindAsync([id], ct);
        if (product == null) return NotFound();

        var addon = new ProductAddon
        {
            ProductId = id,
            Name = req.Name,
            Description = req.Description ?? string.Empty,
            Price = req.Price,
            IsActive = true
        };
        db.ProductAddons.Add(addon);
        await db.SaveChangesAsync(ct);
        return Ok(new ProductAddonDto(addon.Id, addon.Name, addon.Description, addon.Price, addon.IsActive));
    }

    /// <summary>Update an addon. [Admin only]</summary>
    [HttpPatch("{id:guid}/addons/{addonId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAddon(Guid id, Guid addonId, [FromBody] UpdateAddonRequest req, [FromServices] SourceEcommerce.Application.Interfaces.IApplicationDbContext db, CancellationToken ct)
    {
        var addon = await db.ProductAddons.FirstOrDefaultAsync(a => a.Id == addonId && a.ProductId == id, ct);
        if (addon == null) return NotFound();

        if (req.Name != null) addon.Name = req.Name;
        if (req.Description != null) addon.Description = req.Description;
        if (req.Price.HasValue) addon.Price = req.Price.Value;
        if (req.IsActive.HasValue) addon.IsActive = req.IsActive.Value;

        await db.SaveChangesAsync(ct);
        return Ok(new ProductAddonDto(addon.Id, addon.Name, addon.Description, addon.Price, addon.IsActive));
    }

    /// <summary>Delete an addon. [Admin only]</summary>
    [HttpDelete("{id:guid}/addons/{addonId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAddon(Guid id, Guid addonId, [FromServices] SourceEcommerce.Application.Interfaces.IApplicationDbContext db, CancellationToken ct)
    {
        var addon = await db.ProductAddons.FirstOrDefaultAsync(a => a.Id == addonId && a.ProductId == id, ct);
        if (addon == null) return NotFound();
        db.ProductAddons.Remove(addon);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
