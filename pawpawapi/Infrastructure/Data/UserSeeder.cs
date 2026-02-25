using Core.Models;
using Dapper;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class UserSeeder
    {
        private readonly DapperDbContext _dbContext;
        public UserSeeder(DapperDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task SeedAsync()
        {
            // Ensure the roles table exists
            using (var conn = _dbContext.GetConnection())
            {
                const string createRolesTableSql = @"
                CREATE TABLE IF NOT EXISTS roles (
                    id UUID PRIMARY KEY,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    value VARCHAR(50) NOT NULL UNIQUE,
                    is_privileged BOOLEAN NOT NULL DEFAULT false,
                    metadata JSONB,
                    colour_name VARCHAR(50),
                    is_clinic_required BOOLEAN NOT NULL DEFAULT false,
                    priority INT NOT NULL DEFAULT 0,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ NOT NULL
                )";
                await conn.ExecuteAsync(createRolesTableSql);

                // Seed initial roles if they don't exist
                var roles = new List<Role>
                {
                    new Role { Id = Guid.NewGuid(), Name = "Super Admin", Value = "super_admin", IsPrivileged = true, ColourName = "#8B0000", IsClinicRequired = false, Priority = 1, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
                    new Role { Id = Guid.NewGuid(), Name = "Administrator", Value = "admin", IsPrivileged = true, ColourName = "#be2d3b", IsClinicRequired = false, Priority = 2, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
                    new Role { Id = Guid.NewGuid(), Name = "Clinic Admin", Value = "clinic_admin", IsPrivileged = true, ColourName = "#FF4500", IsClinicRequired = true, Priority = 3, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
                    new Role { Id = Guid.NewGuid(), Name = "Veterinarian", Value = "veterinarian", IsPrivileged = true, ColourName = "#2d87be", IsClinicRequired = true, Priority = 6, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
                    new Role { Id = Guid.NewGuid(), Name = "Technician", Value = "technician", IsPrivileged = false, ColourName = "#2dbe6e", IsClinicRequired = false, Priority = 4, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow },
                    new Role { Id = Guid.NewGuid(), Name = "Receptionist", Value = "receptionist", IsPrivileged = false, ColourName = "#be9d2d", IsClinicRequired = true, Priority = 5, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow }
                };

                foreach (var role in roles)
                {
                    var exists = await conn.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM roles WHERE value = @Value", new { role.Value });
                    if (exists == 0)
                    {
                        const string sql = @"
                        INSERT INTO roles (id, name, value, is_privileged,colour_name,is_clinic_required, priority, created_at, updated_at)
                        VALUES (@Id, @Name, @Value, @IsPrivileged,@ColourName,@IsClinicRequired, @Priority, @CreatedAt, @UpdatedAt)";
                        await conn.ExecuteAsync(sql, role);
                    }
                }
            }

            // Ensure the users table exists
            using (var conn = _dbContext.GetConnection())
            {
                const string createTableSql = @"
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    role VARCHAR(50),
                    role_id UUID REFERENCES roles(id),
                    company_id UUID,
                    is_active BOOLEAN NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL
                )";
                await conn.ExecuteAsync(createTableSql);
            }

            // Get role IDs for user creation
            var roleIds = new Dictionary<string, Guid>();
            using (var conn = _dbContext.GetConnection())
            {
                var roles = await conn.QueryAsync<(string Value, Guid Id)>("SELECT value, id FROM roles");
                foreach (var role in roles)
                {
                    roleIds[role.Value] = role.Id;
                }
            }

            var users = new List<User>
            {
/*                new User { Id = Guid.NewGuid(), Email = "admin@pawpaw.com", PasswordHash = HashPassword("admin123"), FirstName = "Admin", LastName = "User", RoleId = roleIds["admin"], CompanyId = defaultCompanyId, IsActive = true, CreatedAt = DateTimeOffset.UtcNow },
                new User { Id = Guid.NewGuid(), Email = "vet@pawpaw.com", PasswordHash = HashPassword("vet123"), FirstName = "Vet", LastName = "User",  RoleId = roleIds["veterinarian"], CompanyId = defaultCompanyId, IsActive = true, CreatedAt = DateTimeOffset.UtcNow },
                new User { Id = Guid.NewGuid(), Email = "reception@pawpaw.com", PasswordHash = HashPassword("reception123"), FirstName = "Reception", LastName = "User", RoleId = roleIds["receptionist"], CompanyId = defaultCompanyId, IsActive = true, CreatedAt = DateTimeOffset.UtcNow },
                new User { Id = Guid.NewGuid(), Email = "tech@pawpaw.com", PasswordHash = HashPassword("tech123"), FirstName = "Tech", LastName = "User", RoleId = roleIds["technician"], CompanyId = defaultCompanyId, IsActive = true, CreatedAt = DateTimeOffset.UtcNow },*/
                new User { Id = Guid.NewGuid(), Email = "superadmin@pawpaw.com", PasswordHash = HashPassword("superadmin123"), FirstName = "SuperAdmin", LastName = "User", RoleId = roleIds["super_admin"], CompanyId = null, IsActive = true, CreatedAt = DateTimeOffset.UtcNow }
                //new User { Id = Guid.NewGuid(), Email = "clinicadmin@pawpaw.com", PasswordHash = HashPassword("clinicadmin123"), FirstName = "ClinicAdmin", LastName = "User", RoleId = roleIds["clinic_admin"], CompanyId = defaultCompanyId, IsActive = true, CreatedAt = DateTimeOffset.UtcNow }
            };

            using (var conn = _dbContext.GetConnection())
            {
                foreach (var user in users)
                {
                    var exists = await conn.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM users WHERE email = @Email", new { user.Email });
                    if (exists == 0)
                    {
                        const string sql = @"
                        INSERT INTO users (id, email, password_hash, first_name, last_name, role_id, company_id, is_active, created_at)
                        VALUES (@Id, @Email, @PasswordHash, @FirstName, @LastName, @RoleId, @CompanyId, @IsActive, @CreatedAt)";
                        await conn.ExecuteAsync(sql, user);
                    }
                }
            }
        }

        private static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }
    }
}