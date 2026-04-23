using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace SourceEcommerce.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid CurrentUserId
    {
        get
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub")
                ?? throw new UnauthorizedAccessException("User not authenticated.");
            return Guid.Parse(claim);
        }
    }

    protected bool IsAdmin => User.IsInRole("Admin");

    protected IActionResult OkOrNotFound<T>(T? value) where T : class
        => value is null ? NotFound() : Ok(value);

    protected IActionResult CreatedWithId<T>(string routeName, Guid id, T value)
        => CreatedAtRoute(routeName, new { id }, value);
}
