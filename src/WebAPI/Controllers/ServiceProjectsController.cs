using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.DTOs.ServiceProject;
using SourceEcommerce.Application.Interfaces;
using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.API.Controllers;

[Route("api/v1/service-projects")]
[Authorize]
public class ServiceProjectsController(IApplicationDbContext db) : BaseApiController
{
    /// <summary>Customer: list my service projects.</summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMine(CancellationToken ct)
    {
        var userId = CurrentUserId;
        var projects = await db.ServiceProjects
            .Include(sp => sp.OrderItem!).ThenInclude(oi => oi.Product)
            .Include(sp => sp.OrderItemAddon!).ThenInclude(a => a.ProductAddon)
            .Where(sp =>
                sp.OrderItem!.Order.UserId == userId ||
                sp.OrderItemAddon!.OrderItem.Order.UserId == userId)
            .AsNoTracking()
            .Select(sp => new ServiceProjectDto(
                sp.Id,
                sp.OrderItemId,
                sp.OrderItemAddonId,
                sp.OrderItem != null ? sp.OrderItem.Product.Title : sp.OrderItemAddon!.ProductAddon.Name,
                sp.Status,
                sp.CustomerNote,
                sp.AdminNote,
                sp.StartedAt,
                sp.CompletedAt,
                sp.DeadlineAt,
                sp.CreatedAt))
            .ToListAsync(ct);

        return Ok(projects);
    }

    /// <summary>Customer: add a note to a service project.</summary>
    [HttpPatch("{id:guid}/note")]
    public async Task<IActionResult> AddNote(Guid id, [FromBody] CustomerUpdateServiceProjectRequest req, CancellationToken ct)
    {
        var project = await db.ServiceProjects
            .Include(sp => sp.OrderItem!).ThenInclude(oi => oi.Order)
            .Include(sp => sp.OrderItemAddon!).ThenInclude(a => a.OrderItem).ThenInclude(oi => oi.Order)
            .FirstOrDefaultAsync(sp => sp.Id == id, ct);

        if (project == null) return NotFound();

        var ownerId = project.OrderItem?.Order.UserId ?? project.OrderItemAddon?.OrderItem.Order.UserId;
        if (ownerId != CurrentUserId) return Forbid();

        project.CustomerNote = req.CustomerNote;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Admin Endpoints ───────────────────────────────────────────────────────

    /// <summary>Admin: list all service projects with optional status filter.</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] ServiceProjectStatus? status, CancellationToken ct)
    {
        var query = db.ServiceProjects
            .Include(sp => sp.OrderItem!).ThenInclude(oi => oi.Product)
            .Include(sp => sp.OrderItemAddon!).ThenInclude(a => a.ProductAddon)
            .AsNoTracking();

        if (status.HasValue) query = query.Where(sp => sp.Status == status);

        var result = await query
            .OrderByDescending(sp => sp.CreatedAt)
            .Select(sp => new ServiceProjectDto(
                sp.Id, sp.OrderItemId, sp.OrderItemAddonId,
                sp.OrderItem != null ? sp.OrderItem.Product.Title : sp.OrderItemAddon!.ProductAddon.Name,
                sp.Status, sp.CustomerNote, sp.AdminNote,
                sp.StartedAt, sp.CompletedAt, sp.DeadlineAt, sp.CreatedAt))
            .ToListAsync(ct);

        return Ok(result);
    }

    /// <summary>Admin: update service project status and notes.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateServiceProjectRequest req, CancellationToken ct)
    {
        var project = await db.ServiceProjects.FindAsync([id], ct);
        if (project == null) return NotFound();

        project.Status = req.Status;
        if (req.AdminNote != null) project.AdminNote = req.AdminNote;
        if (req.DeadlineAt.HasValue) project.DeadlineAt = req.DeadlineAt;
        if (req.StartedAt.HasValue) project.StartedAt = req.StartedAt;
        if (req.CompletedAt.HasValue) project.CompletedAt = req.CompletedAt;

        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
