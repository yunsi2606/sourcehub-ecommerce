using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.API.Controllers;

public class CategoriesController(IApplicationDbContext db) : BaseApiController
{
    /// <summary>Get all active categories.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var categories = await db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new { c.Id, c.Name, c.Slug, c.Description, c.IconUrl })
            .ToListAsync(ct);

        return Ok(categories);
    }

    [HttpGet("{id:guid}", Name = "GetCategoryById")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var cat = await db.Categories.FindAsync([id], ct);
        return OkOrNotFound(cat);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CategoryRequest req, CancellationToken ct)
    {
        var slug = req.Name.ToLowerInvariant().Replace(" ", "-");
        var category = new Category { Name = req.Name, Slug = slug, Description = req.Description, IconUrl = req.IconUrl };
        db.Categories.Add(category);
        await db.SaveChangesAsync(ct);
        return CreatedAtRoute("GetCategoryById", new { id = category.Id }, category);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CategoryRequest req, CancellationToken ct)
    {
        var cat = await db.Categories.FindAsync([id], ct);
        if (cat == null) return NotFound();
        cat.Name = req.Name;
        cat.Description = req.Description;
        cat.IconUrl = req.IconUrl;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var cat = await db.Categories.FindAsync([id], ct);
        if (cat == null) return NotFound();
        cat.IsActive = false;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record CategoryRequest(string Name, string? Description, string? IconUrl);
