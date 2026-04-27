# Agent Guidelines — source-ecommerce

Tài liệu này ghi lại các quy tắc **BẮT BUỘC** khi viết code cho dự án này.
Agent cần đọc file này trước khi tạo bất kỳ file mới nào.

---

## 1. Cấu trúc dự án (Project Structure)

```
src/
├── Core/
│   ├── Domain/
│   │   ├── Entities/          # Entity classes (User.cs, Order.cs, ...)
│   │   ├── Enums/             # Enums (UserRole.cs, OrderStatus.cs, ...)
│   │   └── Interfaces/        # Domain-level interfaces (IStorageService.cs, ...)
│   └── Application/
│       ├── DTOs/
│       │   ├── Auth/          # AuthDtos.cs, OAuthDtos.cs
│       │   ├── Order/         # OrderDtos.cs
│       │   ├── Product/       # ProductDtos.cs
│       │   └── <Domain>/      # Mỗi domain 1 thư mục, 1 file *Dtos.cs
│       ├── Interfaces/        # Application-level interfaces (IApplicationDbContext.cs, ...)
│       ├── Services/          # Business logic services (AuthService.cs, OAuthService.cs, ...)
│       └── DependencyInjection.cs
├── Infrastructure/
│   ├── Persistence/           # AppDbContext, Migrations/
│   ├── Repositories/
│   ├── Services/              # Infrastructure services (StripeService.cs, R2StorageService.cs, ...)
│   └── DependencyInjection.cs
└── WebAPI/
    ├── Controllers/           # API controllers (AuthController.cs, OAuthController.cs, ...)
    └── Program.cs
```

---

## 2. Quy tắc đặt file (File Placement Rules)

| Loại code | Vị trí đúng |
|---|---|
| DTO / Request / Response records | `Core/Application/DTOs/<Domain>/<Domain>Dtos.cs` |
| Business logic | `Core/Application/Services/<Name>Service.cs` |
| Controller endpoints | `WebAPI/Controllers/<Name>Controller.cs` |
| Entity (DB model) | `Core/Domain/Entities/<Name>.cs` |
| Enum | `Core/Domain/Enums/<Name>.cs` |
| Infrastructure service | `Infrastructure/Services/<Name>Service.cs` |

**❌ KHÔNG BAO GIỜ:**
- Đặt `record`, `class` DTO ở cuối file Service hoặc Controller
- Gom nhiều loại (DTO + Service logic) vào cùng 1 file
- Đặt request/response record trong file Controller

---

## 3. Cách thêm DTOs mới

Khi một domain mới cần DTOs (ví dụ OAuth):
1. Tạo file mới: `Core/Application/DTOs/Auth/OAuthDtos.cs`
2. Namespace: `namespace SourceEcommerce.Application.DTOs.Auth;`
3. Import trong Controller: `using SourceEcommerce.Application.DTOs.Auth;`

---

## 4. Cách đăng ký Service mới

Thêm vào `Core/Application/DependencyInjection.cs`:
```csharp
services.AddScoped<MyNewService>();
```

Nếu cần `IHttpClientFactory`:
```csharp
services.AddHttpClient();
```

---

## 5. Frontend — Next.js

```
WebUI/src/
├── app/[locale]/
│   ├── (auth)/            # Auth pages (login, register, totp, callback)
│   ├── (storefront)/      # Public storefront pages
│   ├── dashboard/         # Admin dashboard pages
│   └── checkout/          # Checkout flow pages
├── components/            # Shared UI components
├── lib/
│   └── api/               # API clients — mỗi domain 1 file (auth.ts, products.ts, ...)
├── stores/                # Zustand stores (authStore.ts, cartStore.ts, ...)
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
```

**Quy tắc frontend:**
- Mỗi domain API có file riêng trong `lib/api/` (không gom vào 1 file)
- Tất cả fetch phải đi qua `apiFetch` (không dùng raw `fetch`) để có auto token refresh
- Dùng `useFormatPrice()` hook cho mọi hiển thị giá tiền (multi-currency)

---

## 6. Cloudflare R2 — Gotcha

`CopyObjectAsync` của AWS SDK không hoạt động với R2 (header `x-amz-tagging-directive` không được hỗ trợ).
**Luôn dùng:** `GetObjectAsync` → buffer vào `MemoryStream` → `PutObjectAsync`.

---

## 7. Environment Variables cần thiết

| Biến | Dùng cho |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth |
| `FRONTEND_URL` | Redirect URL sau OAuth callback |
| `Stripe__SecretKey` / `Stripe__WebhookSecret` | Stripe payments |

---

## 8. Migration

Mỗi khi thêm field vào Entity, phải chạy migration:
```bash
dotnet ef migrations add <MigrationName> -p src/Infrastructure -s src/WebAPI
dotnet ef database update -p src/Infrastructure -s src/WebAPI
```
