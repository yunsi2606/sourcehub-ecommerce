namespace SourceEcommerce.Domain.Interfaces;

/// <summary>
/// Unit of Work pattern — coordinates multiple repository operations in a single transaction.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
