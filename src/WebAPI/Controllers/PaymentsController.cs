using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SourceEcommerce.Application.DTOs.Order;
using SourceEcommerce.Application.Services;

namespace SourceEcommerce.API.Controllers;

/// <summary>
/// Payment gateway integration: initiate payment sessions and receive webhooks.
/// Extensible to support multiple gateways (Stripe, VNPay, Momo, etc.)
/// </summary>
public class PaymentsController(PaymentService paymentService) : BaseApiController
{
    /// <summary>
    /// Initiate a payment for an existing pending order via Stripe Checkout.
    /// Returns a redirect URL for the payment gateway.
    /// </summary>
    [HttpPost("initiate/stripe")]
    [Authorize]
    public async Task<IActionResult> InitiateStripe([FromBody] InitiateOrderPaymentRequest req, CancellationToken ct)
    {
        var redirectUrl = await paymentService.InitiateStripeCheckoutAsync(CurrentUserId, req.OrderId, ct);
        return Ok(new { redirectUrl });
    }

    /// <summary>
    /// Stripe webhook endpoint — receives payment events and fulfills orders.
    /// Must NOT be authenticated (called by Stripe servers directly).
    /// </summary>
    [HttpPost("webhook/stripe")]
    [AllowAnonymous]
    public async Task<IActionResult> StripeWebhook(CancellationToken ct)
    {
        var payload = await new StreamReader(Request.Body).ReadToEndAsync(ct);
        var signature = Request.Headers["Stripe-Signature"].FirstOrDefault() ?? string.Empty;

        try
        {
            await paymentService.HandleStripeWebhookAsync(payload, signature, ct);
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public record InitiateOrderPaymentRequest(Guid OrderId);
