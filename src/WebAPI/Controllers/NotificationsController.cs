using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SourceEcommerce.Application.Interfaces;

namespace SourceEcommerce.API.Controllers;

[Authorize]
public class NotificationsController(IApplicationDbContext db) : BaseApiController
{
    /// <summary>Get current user's notifications (newest first).</summary>
    [HttpGet]
    public async Task<IActionResult> GetMine([FromQuery] bool unreadOnly = false, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var query = db.Notifications
            .Where(n => n.UserId == CurrentUserId)
            .AsNoTracking();

        if (unreadOnly) query = query.Where(n => !n.IsRead);

        var total = await query.CountAsync(ct);
        var unreadCount = await db.Notifications.CountAsync(n => n.UserId == CurrentUserId && !n.IsRead, ct);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Message,
                n.Type,
                n.IsRead,
                n.RedirectUrl,
                n.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(new { items, total, unreadCount, page, pageSize });
    }

    /// <summary>Mark a notification as read.</summary>
    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        var notification = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == CurrentUserId, ct);

        if (notification == null) return NotFound();

        notification.IsRead = true;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Mark all notifications as read.</summary>
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        await db.Notifications
            .Where(n => n.UserId == CurrentUserId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);

        return NoContent();
    }

    /// <summary>Delete a notification.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var notification = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == CurrentUserId, ct);

        if (notification == null) return NotFound();

        db.Notifications.Remove(notification);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
