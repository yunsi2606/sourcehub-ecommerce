using SourceEcommerce.Domain.Interfaces;
using SourceEcommerce.Infrastructure.Persistence;

namespace SourceEcommerce.Infrastructure.Repositories;

public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await context.SaveChangesAsync(ct);

    public void Dispose() => context.Dispose();
}
