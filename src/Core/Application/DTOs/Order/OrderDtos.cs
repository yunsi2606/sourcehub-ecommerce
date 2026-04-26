using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Application.DTOs.Order;

// Checkout

public record CheckoutItemRequest(
    Guid ProductId,
    int Quantity,
    List<Guid>? SelectedAddonIds
);

public record CreateOrderRequest(
    List<CheckoutItemRequest> Items,
    string? Notes
);

// Order Responses

public record OrderItemAddonDto(
    Guid ProductAddonId,
    string AddonName,
    decimal PriceAtPurchase
);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductTitle,
    string ProductSlug,
    string? ProductThumbnail,
    decimal PriceAtPurchase,
    int Quantity,
    List<OrderItemAddonDto> Addons
);

public record OrderSummaryDto(
    Guid Id,
    OrderStatus Status,
    decimal SubTotal,
    decimal DiscountAmount,
    decimal TotalAmount,
    int ItemCount,
    DateTime CreatedAt,
    string Currency = "VND"
);

public record OrderDetailDto(
    Guid Id,
    Guid UserId,
    OrderStatus Status,
    decimal SubTotal,
    decimal DiscountAmount,
    decimal TotalAmount,
    string? Notes,
    List<OrderItemDto> Items,
    List<PaymentDto> Payments,
    DateTime CreatedAt,
    string Currency = "VND"
);

public record PaymentDto(
    Guid Id,
    PaymentGateway PaymentGateway,
    string? TransactionId,
    decimal Amount,
    PaymentStatus Status,
    DateTime? PaidAt
);

// Payment

public record InitiatePaymentRequest(
    Guid OrderId,
    PaymentGateway Gateway,
    string? ReturnUrl
);

public record PaymentInitiatedResponse(
    Guid PaymentId,
    string? RedirectUrl, // VNPay / Momo redirect
    string? ClientSecret // Stripe
);

// Download

public record DownloadUrlResponse(
    string PresignedUrl,
    string FileName,
    long FileSizeBytes,
    DateTime ExpiresAt
);

// My Orders Query

public record OrderQueryParams(
    OrderStatus? Status,
    string Currency = "VND",
    int Page = 1,
    int PageSize = 10
);
