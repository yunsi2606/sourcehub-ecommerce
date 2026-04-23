namespace SourceEcommerce.Application.DTOs.Review;

public record CreateReviewRequest(
    Guid ProductId,
    Guid OrderItemId,
    int Rating,
    string? Comment
);

public record ReviewDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string? UserAvatarUrl,
    Guid ProductId,
    int Rating,
    string? Comment,
    bool IsApproved,
    DateTime CreatedAt
);

public record ReviewListResponse(
    IEnumerable<ReviewDto> Items,
    double AverageRating,
    int TotalCount,
    int Page,
    int PageSize
);
