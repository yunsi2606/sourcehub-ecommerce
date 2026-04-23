using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Application.DTOs.Subscription;

public record SubscriptionDto(
    Guid Id,
    Guid? OrderItemId,
    string ProductTitle,
    SubscriptionStatus Status,
    bool AutoRenew,
    DateTime CurrentPeriodStart,
    DateTime CurrentPeriodEnd,
    DateTime? CancelledAt,
    List<SubscriptionPaymentDto> Payments
);

public record SubscriptionPaymentDto(
    Guid Id,
    decimal Amount,
    PaymentStatus PaymentStatus,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    DateTime? PaidAt
);

public record UpdateSubscriptionRequest(bool AutoRenew);
