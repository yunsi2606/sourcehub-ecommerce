using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceEcommerce.Application.Services;

namespace SourceEcommerce.API.Controllers;

/// <summary>
/// Secure file download endpoints using Cloudflare R2 pre-signed URLs.
/// </summary>
[Authorize]
public class DownloadsController(DownloadService downloadService) : BaseApiController
{
    /// <summary>
    /// Get a short-lived pre-signed download URL for a source code archive.
    /// Validates that the current user has a paid order containing this item.
    /// </summary>
    [HttpGet("{orderItemId:guid}/{productFileId:guid}")]
    public async Task<IActionResult> GetDownloadUrl(
        Guid orderItemId,
        Guid productFileId,
        CancellationToken ct)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = Request.Headers.UserAgent.ToString();

            var result = await downloadService.GetDownloadUrlAsync(
                CurrentUserId, orderItemId, productFileId, ipAddress, userAgent, ct);

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>List all source code products the current user has purchased.</summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMyDownloads(CancellationToken ct)
        => Ok(await downloadService.GetMyDownloadsAsync(CurrentUserId, ct));
}
