using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceEcommerce.Application.DTOs.Plan;
using SourceEcommerce.Application.Services;

namespace SourceEcommerce.API.Controllers;

public class PlansController(PlanService planService) : BaseApiController
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetActivePlans(CancellationToken ct)
    {
        return Ok(await planService.GetActivePlansAsync(ct));
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyCurrentPlan(CancellationToken ct)
    {
        return Ok(await planService.GetUserCurrentPlanAsync(CurrentUserId, ct));
    }

    [HttpPost("checkout")]
    [Authorize]
    public async Task<IActionResult> CreateCheckout([FromBody] CreatePlanCheckoutRequest req, CancellationToken ct)
    {
        var checkoutUrl = await planService.CreateCheckoutSessionAsync(CurrentUserId, req, ct);
        return Ok(new { checkoutUrl });
    }

    [HttpGet("billing-portal")]
    [Authorize]
    public async Task<IActionResult> GetBillingPortal(CancellationToken ct)
    {
        var portalUrl = await planService.CreateBillingPortalSessionAsync(CurrentUserId, ct);
        return Ok(new { portalUrl });
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> StripeWebhook(CancellationToken ct)
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync(ct);
        var signature = Request.Headers["Stripe-Signature"].FirstOrDefault();

        if (string.IsNullOrEmpty(signature))
            return BadRequest();

        try
        {
            await planService.HandleStripeWebhookAsync(json, signature, ct);
            return Ok();
        }
        catch (Stripe.StripeException e)
        {
            return BadRequest(e.Message);
        }
    }
}
