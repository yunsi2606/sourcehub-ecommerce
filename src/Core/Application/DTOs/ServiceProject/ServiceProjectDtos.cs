using SourceEcommerce.Domain.Enums;

namespace SourceEcommerce.Application.DTOs.ServiceProject;

public record ServiceProjectDto(
    Guid Id,
    Guid? OrderItemId,
    Guid? OrderItemAddonId,
    string ServiceName,
    ServiceProjectStatus Status,
    string? CustomerNote,
    string? AdminNote,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    DateTime? DeadlineAt,
    DateTime CreatedAt
);

public record UpdateServiceProjectRequest(
    ServiceProjectStatus Status,
    string? AdminNote,
    DateTime? DeadlineAt,
    DateTime? StartedAt,
    DateTime? CompletedAt
);

public record CustomerUpdateServiceProjectRequest(string CustomerNote);
