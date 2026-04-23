FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER app
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj files and restore as distinct layers
COPY ["src/WebAPI/SourceEcommerce.API.csproj", "src/WebAPI/"]
COPY ["src/Core/Application/SourceEcommerce.Application.csproj", "src/Core/Application/"]
COPY ["src/Core/Domain/SourceEcommerce.Domain.csproj", "src/Core/Domain/"]
COPY ["src/Infrastructure/SourceEcommerce.Infrastructure.csproj", "src/Infrastructure/"]
RUN dotnet restore "./src/WebAPI/SourceEcommerce.API.csproj"

# Copy the remaining source code
COPY . .
WORKDIR "/src/src/WebAPI"
RUN dotnet build "./SourceEcommerce.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./SourceEcommerce.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SourceEcommerce.API.dll"]
