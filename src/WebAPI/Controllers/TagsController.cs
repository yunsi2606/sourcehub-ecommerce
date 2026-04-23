using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Entities;

namespace SourceEcommerce.API.Controllers;

public class TagsController(IApplicationDbContext db) : BaseApiController
{
    /// <summary>Get all tags (public).</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var tags = await db.Tags
            .AsNoTracking()
            .OrderBy(t => t.Name)
            .Select(t => new { t.Id, t.Name, t.Slug })
            .ToListAsync(ct);

        return Ok(tags);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] TagRequest req, CancellationToken ct)
    {
        var slug = req.Name.ToLowerInvariant().Replace(" ", "-");
        var tag = new Tag { Name = req.Name, Slug = slug };
        db.Tags.Add(tag);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, tag);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var tag = await db.Tags.FindAsync([id], ct);
        if (tag == null) return NotFound();
        db.Tags.Remove(tag);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record TagRequest(string Name);
