# PawPaw Backend (.NET Clean Architecture)

## Overview
PawPaw is a veterinary management backend built with .NET, PostgreSQL, and Dapper, following strict Clean Architecture principles. It features robust authentication/authorization (JWT, roles), clear separation of concerns, and modern API best practices.

---

## Architecture
- **Core**: Domain models and repository interfaces (no external dependencies).
- **Application**: DTOs, service interfaces, business logic, AutoMapper profiles.
- **Infrastructure**: Dapper repositories, database context, seeders.
- **Api**: Controllers, DI setup, middleware, Swagger, authentication.

### Layered Dependency Flow
```
Api
 ↑
Application
 ↑
Core
 ↑
Infrastructure
```

---

## Folder Structure & Key Files

```
├── Core/
│   ├── Models/           # POCOs matching DB tables
│   ├── Interfaces/       # Repository interfaces
│   └── Exceptions/       # Custom exceptions (optional)
├── Application/
│   ├── DTOs/             # Request/Response DTOs
│   ├── Interfaces/       # Service interfaces
│   ├── Mappings/         # AutoMapper profiles
│   └── Services/         # Business logic
├── Infrastructure/
│   ├── Data/             # DapperDbContext, seeders
│   └── Repositories/     # Dapper repository implementations
├── Api/
│   ├── Controllers/      # API endpoints
│   ├── Properties/       # launchSettings.json
│   ├── Program.cs        # DI, middleware, Swagger, Dapper config
│   └── ExceptionMiddleware.cs # Global error handling
├── CursorBackendRules.md # Architecture & code quality rules
├── README.md             # This file
└── ...
```

---

## Key Features
- **Dapper** for all data access (no Entity Framework)
- **AutoMapper** for model/DTO mapping
- **JWT Authentication** with role-based authorization
- **Global Exception Middleware** for clean error responses
- **Strict DTO usage** (never expose models directly)
- **Swagger** for API docs
- **Seeders** for sample data

---

## Authentication & Authorization
- **JWT Bearer tokens** for all protected endpoints
- **Roles**: `admin`, `veterinarian`, `technician`, `receptionist`
- **[Authorize]** on controllers/actions for authentication
- **[Authorize(Roles = "admin")]** for admin-only endpoints (e.g., Payment)
- **Passwords** are always hashed (SHA256) before storage
- **Registration** checks for duplicate emails and valid roles

---

## Setup & Run

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
- PostgreSQL database

### 1. Clone the Repository
```sh
git clone <repo-url>
cd PawPaw/backend
```

### 2. Configure Database
- Update your connection string in `Infrastructure/Data/DapperDbContext.cs` or via environment variables.
- Ensure your PostgreSQL DB is created and accessible.

### 3. Configure JWT
- Edit `Api/appsettings.json`:
  - Set a secure, 32+ character `Jwt:Key`.
  - Set `Jwt:Issuer` as needed.

### 4. Build & Run
```sh
dotnet build
cd Api
DOTNET_ENVIRONMENT=Development dotnet run
```
- The API will run on the port specified in `launchSettings.json` (default: 5000/5001).

### 5. Database Seeding
- On first run, sample users (admin, veterinarian, technician, receptionist) are seeded automatically.

### 6. API Usage
- Visit `/swagger` for interactive API docs.
- Use `/api/auth/login` to obtain a JWT token.
- Use the JWT as a Bearer token for all protected endpoints.

---

## Example Users
| Email                | Password   | Role          |
|----------------------|------------|---------------|
| admin@pawpaw.com     | admin123   | admin         |
| vet@pawpaw.com       | vet123     | veterinarian  |
| tech@pawpaw.com      | tech123    | technician    |
| reception@pawpaw.com | reception123| receptionist |

---

## Best Practices & Rules
- See [`CursorBackendRules.md`](./CursorBackendRules.md) for full architecture, security, and code quality rules.
- **Dapper:** Always set `Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;` in `Program.cs`.
- **DTOs:** Use nullable properties unless always required.
- **Error Handling:** All errors return JSON with appropriate HTTP status codes.
- **Auth:** Use strong JWT keys, hash passwords, and validate all input.

---

## Contributing
- Follow the architecture and code quality rules in `CursorBackendRules.md`.
- Write unit/integration tests for all new features.
- Document all endpoints and DTOs with XML comments for Swagger.

---

## License
