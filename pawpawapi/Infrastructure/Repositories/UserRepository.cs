using Core.Interfaces;
using Core.Models;
using Dapper;
using Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly DapperDbContext _dbContext;

        public UserRepository(DapperDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();

            // Get user with role information
            string userSql = @"SELECT
                        u.*,
                        r.name as RoleName,
                        r.value as RoleValue
                    FROM users u
                    LEFT JOIN roles r ON u.role_id = r.id
                    WHERE u.id = @Id";

            var user = await connection.QueryFirstOrDefaultAsync<User>(userSql, new { Id = id });

            if (user != null)
            {
                // Get clinic mappings for the user
                user.ClinicMappings = (await GetUserClinicMappingsAsync(id)).ToList();
            }

            return user;
        }

        public async Task<Dictionary<Guid, User>> GetByIdsAsync(IEnumerable<Guid> ids)
        {
            var idsList = ids.ToList();
            if (idsList.Count == 0)
            {
                return new Dictionary<Guid, User>();
            }

            using var connection = _dbContext.GetConnection();

            // Batch load users with role information in a single query
            const string userSql = @"SELECT
                        u.*,
                        r.name as RoleName,
                        r.value as RoleValue
                    FROM users u
                    LEFT JOIN roles r ON u.role_id = r.id
                    WHERE u.id = ANY(@Ids)";

            var users = (await connection.QueryAsync<User>(userSql, new { Ids = idsList.ToArray() })).ToList();

            // Build dictionary for quick lookup
            var userDict = users.ToDictionary(u => u.Id);

            return userDict;
        }

        public async Task<(IEnumerable<User> Items, int TotalCount)> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid[]? roleIds = null,
            Guid[]? clinicIds = null,
            bool paginationRequired = true, Guid? companyId = null)
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                var whereClause = new List<string>();
                var parameters = new DynamicParameters();

                whereClause.Add("(c.is_active = true)");

                if (roleIds != null && roleIds.Length > 0)
                {
                    whereClause.Add("u.role_id = ANY(@RoleIds)");
                    parameters.Add("RoleIds", roleIds);
                }

                if (clinicIds != null && clinicIds.Length > 0)
                {
                    whereClause.Add("EXISTS (SELECT 1 FROM users_clinic_mapping ucm WHERE ucm.user_id = u.id AND ucm.clinic_id = ANY(@ClinicIds))");
                    parameters.Add("ClinicIds", clinicIds);
                }
                if (companyId.HasValue)
                {
                    whereClause.Add("u.company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId);
                }

                var whereClauseStr = whereClause.Count > 0
                    ? "WHERE " + string.Join(" AND ", whereClause)
                    : "";

                var countSql = $@"
                    SELECT COUNT(*) 
                    FROM users u 
                    LEFT JOIN roles r ON u.role_id = r.id 
                    LEFT JOIN company c ON c.id = u.company_id 
                    {whereClauseStr}";
                var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

                var sql = $@"
                    SELECT 
                        u.*,
                        r.name as RoleName,
                        r.value as RoleValue,
                        r.id as RoleId
                    FROM users u 
                    LEFT JOIN roles r ON u.role_id = r.id 
                    LEFT JOIN company c ON c.id = u.company_id 
                    {whereClauseStr}
                    ORDER BY u.created_at DESC";

                if (paginationRequired)
                {
                    var offset = (pageNumber - 1) * pageSize;
                    sql += " LIMIT @PageSize OFFSET @Offset";
                    parameters.Add("PageSize", pageSize);
                    parameters.Add("Offset", offset);
                }

                var items = await connection.QueryAsync<User>(sql, parameters);

                // Load clinic mappings for each user
                foreach (var user in items)
                {
                    user.ClinicMappings = (await GetUserClinicMappingsAsync(user.Id)).ToList();
                }

                return (items, totalCount);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<IEnumerable<User>> GetAllUserAsync()
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                var sql = @"
                SELECT u.*, r.name as RoleName, r.value as RoleValue, r.id as RoleId 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC";

                var users = await connection.QueryAsync<User>(sql);

                return users;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllUserAsync: {ex.Message}");
                throw;
            }
        }


        public async Task<User> AddAsync(User user)
        {
            try
            {
                // Ensure required fields are set
                if (string.IsNullOrEmpty(user.Email))
                    throw new ArgumentException("Email is required");
                if (string.IsNullOrEmpty(user.PasswordHash))
                    throw new ArgumentException("Password is required");
                if (string.IsNullOrEmpty(user.FirstName))
                    throw new ArgumentException("First name is required");
                if (user.RoleId == Guid.Empty)
                    throw new ArgumentException("Role ID is required");

                // Set default values
                user.Id = Guid.NewGuid();
                user.IsActive = true;
                user.CreatedAt = DateTime.UtcNow;
                user.Email = user.Email.ToLowerInvariant();

                const string sql = @"
                    INSERT INTO users (
                        id,
                        email,
                        password_hash,
                        first_name,
                        last_name,
                        role_id,
                        company_id,
                        is_active,
                        created_at
                    )
                    VALUES (
                        @Id,
                        @Email,
                        @PasswordHash,
                        @FirstName,
                        @LastName,
                        @RoleId,
                        @CompanyId,
                        @IsActive,
                        @CreatedAt
                    )
                    RETURNING *;";
                user.CreatedAt = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;
                using var connection = _dbContext.GetConnection();
                var result = await connection.QueryFirstOrDefaultAsync<User>(sql, user);

                if (result == null)
                {
                    throw new InvalidOperationException("Failed to create user");
                }
                const string selectSql = @"
                SELECT 
                    u.*
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.id = @Id";

                var createdUser = await connection.QueryFirstOrDefaultAsync<User>(selectSql, new { Id = user.Id });
                if (createdUser == null)
                    throw new InvalidOperationException("Failed to retrieve created user.");

                return createdUser;

            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error creating user: {ex.Message}", ex);
            }
        }

        public async Task<User> UpdateAsync(User user)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                var updates = new List<string>();
                var parameters = new DynamicParameters();

                parameters.Add("Id", user.Id); // Required for WHERE clause

                if (!string.IsNullOrWhiteSpace(user.Email))
                {
                    updates.Add("email = @Email");
                    parameters.Add("Email", user.Email);
                }

                if (!string.IsNullOrWhiteSpace(user.PasswordHash))
                {
                    updates.Add("password_hash = @PasswordHash");
                    parameters.Add("PasswordHash", user.PasswordHash);
                }

                if (!string.IsNullOrWhiteSpace(user.FirstName))
                {
                    updates.Add("first_name = @FirstName");
                    parameters.Add("FirstName", user.FirstName);
                }

                if (!string.IsNullOrWhiteSpace(user.LastName))
                {
                    updates.Add("last_name = @LastName");
                    parameters.Add("LastName", user.LastName);
                }

                if (user.RoleId != Guid.Empty)
                {
                    updates.Add("role_id = @RoleId");
                    parameters.Add("RoleId", user.RoleId);
                }

                if (user.CompanyId.HasValue)
                {
                    updates.Add("company_id = @CompanyId");
                    parameters.Add("CompanyId", user.CompanyId.Value);
                }
                else
                {
                    updates.Add("company_id = NULL");
                }



                updates.Add("is_active = @IsActive");
                parameters.Add("IsActive", user.IsActive);

                updates.Add("last_login = @LastLogin");
                parameters.Add("LastLogin", user.LastLogin);

                updates.Add("updated_at = CURRENT_TIMESTAMP");

                if (!updates.Any())
                    throw new InvalidOperationException("No fields provided for update.");

                var query = $@"
UPDATE users
SET {string.Join(", ", updates)}
FROM roles
WHERE users.id = @Id AND roles.id = @RoleId
RETURNING
    users.id,
    users.email,
    users.password_hash,
    users.first_name,
    users.last_name,
    users.role_id,
    users.company_id,
    users.is_active,
    users.last_login,
    users.created_at,
    users.updated_at,
    roles.name AS ""RoleName"",
    roles.value AS ""RoleValue"";";

                var result = await connection.QuerySingleOrDefaultAsync(query, parameters);

                if (result == null)
                    return null;

                return new User
                {
                    Id = result.id,
                    Email = result.email,
                    PasswordHash = result.password_hash,
                    FirstName = result.first_name,
                    LastName = result.last_name,
                    RoleId = result.role_id,
                    CompanyId = result.company_id,
                    IsActive = result.is_active,
                    LastLogin = result.last_login,
                    RoleName = result.RoleName,
                    RoleValue = result.RoleValue,
                    CreatedAt = result.created_at,
                    UpdatedAt = result.updated_at
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating user: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM users WHERE id = @Id";
            using var connection = _dbContext.GetConnection();
            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
            return rowsAffected > 0;
        }

        public async Task<User?> GetByEmailAndCompanyAsync(string email, Guid? companyId)
        {
            const string sql = @"
        SELECT
            u.id AS Id,
            u.email AS Email,
            u.password_hash AS PasswordHash,
            u.first_name AS FirstName,
            u.last_name AS LastName,
            u.role_id AS RoleId,
            r.name AS RoleName,
            r.value AS RoleValue,
            u.company_id AS CompanyId,
            u.is_active AS IsActive,
            u.last_login AS LastLogin,
            u.created_at AS CreatedAt,
            u.updated_at AS UpdatedAt
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(@Email))
          AND (u.company_id IS NOT DISTINCT FROM @CompanyId) AND u.is_active=true;
    ";
            try
            {
                using var connection = _dbContext.GetConnection();
                return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email, CompanyId = companyId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetByEmailAndCompanyAsync: {ex.Message}");
                return null;
            }
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            const string sql = @"
        SELECT
            u.id AS Id,
            u.email AS Email,
            u.password_hash AS PasswordHash,
            u.first_name AS FirstName,
            u.last_name AS LastName,
            u.role_id AS RoleId,
            r.name AS RoleName,
            r.value AS RoleValue,
            u.company_id AS CompanyId,
            u.is_active AS IsActive,
            u.last_login AS LastLogin,
            u.created_at AS CreatedAt,
            u.updated_at AS UpdatedAt
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE LOWER(u.email) = LOWER(@Email);
    ";

            try
            {
                using var connection = _dbContext.GetConnection();
                var user = await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });

                if (user != null)
                {
                    // Get clinic mappings for the user
                    user.ClinicMappings = (await GetUserClinicMappingsAsync(user.Id)).ToList();
                }

                return user;
            }
            catch (Exception ex)
            {
                // Optionally log the exception
                Console.WriteLine($"Error in GetByEmailAsync: {ex.Message}");
                return null;
            }
        }


        public async Task<IEnumerable<User>> GetByClinicIdAsync(Guid clinicId)
        {
            const string sql = @"
                SELECT DISTINCT u.* ,
                r.name AS RoleName,
                r.value AS RoleValue
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                INNER JOIN users_clinic_mapping ucm ON u.id = ucm.user_id
                WHERE ucm.clinic_id = @ClinicId";
            using var connection = _dbContext.GetConnection();
            return await connection.QueryAsync<User>(sql, new { ClinicId = clinicId });
        }

        public async Task AddUserSlotsAsync(Guid userId, IEnumerable<Guid> slotIds, Guid? clinicId = null)
        {
            if (slotIds == null) return;
            using var connection = _dbContext.GetConnection();
            const string sql = @"INSERT INTO user_doctor_slot (user_id, slot_id, clinic_id) VALUES (@UserId, @SlotId, @ClinicId);";
            foreach (var slotId in slotIds)
            {
                await connection.ExecuteAsync(sql, new { UserId = userId, SlotId = slotId, ClinicId = clinicId });
            }
        }

        public async Task<IEnumerable<Guid>> GetSlotIdsByUserIdAsync(Guid userId)
        {
            try
            {
                const string sql = "SELECT slot_id FROM user_doctor_slot WHERE user_id = @UserId";
                using var connection = _dbContext.GetConnection();
                return await connection.QueryAsync<Guid>(sql, new { UserId = userId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetSlotIdsByUserIdAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<IEnumerable<UserDoctorSlot>> GetUserDoctorSlotsAsync(Guid userId)
        {
            try
            {
                const string sql = @"
                    SELECT
                        id AS Id,
                        user_id AS UserId,
                        slot_id AS SlotId,
                        clinic_id AS ClinicId,
                        created_at AS CreatedAt,
                        updated_at AS UpdatedAt
                    FROM user_doctor_slot
                    WHERE user_id = @UserId";
                using var connection = _dbContext.GetConnection();
                return await connection.QueryAsync<UserDoctorSlot>(sql, new { UserId = userId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserDoctorSlotsAsync: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteUserSlotsAsync(Guid userId)
        {
            try
            {
                const string sql = "DELETE FROM user_doctor_slot WHERE user_id = @UserId";
                using var connection = _dbContext.GetConnection();
                await connection.ExecuteAsync(sql, new { UserId = userId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteUserSlotsAsync: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteUserClinicSlotsAsync(Guid userId, Guid? clinicId)
        {
            try
            {
                string sql = "DELETE FROM user_doctor_slot WHERE user_id = @UserId ";
                if (clinicId != null)
                {
                    sql += "AND clinic_id =@ClinicId";
                }
                using var connection = _dbContext.GetConnection();
                await connection.ExecuteAsync(sql, new { UserId = userId, ClinicId= clinicId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteUserSlotsAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByVeterinarianAndDateAsync(Guid veterinarianId, DateTime date)
        {
            try
            {
                const string sql = @"SELECT * FROM appointments WHERE veterinarian_id = @VeterinarianId AND appointment_date = @Date;";
                using var connection = _dbContext.GetConnection();
                return await connection.QueryAsync<Appointment>(sql, new { VeterinarianId = veterinarianId, Date = date.Date });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAppointmentsByVeterinarianAndDateAsync: {ex.Message}");
                throw;
            }
        }

        public async Task AddUserClinicMappingsAsync(Guid userId, IEnumerable<Guid> clinicIds)
        {
            try
            {
                using var connection = _dbContext.GetConnection();

                var now = DateTime.UtcNow;
                clinicIds = clinicIds?.ToList() ?? new List<Guid>(); // Ensure list usage

                // 1?? Deactivate all clinics first (soft delete)
                const string deactivateSql = @"
            UPDATE users_clinic_mapping
            SET is_active = false, updated_at = @UpdatedAt
            WHERE user_id = @UserId;
             ";

                await connection.ExecuteAsync(deactivateSql, new
                {
                    UserId = userId,
                    UpdatedAt = now
                });

                // If no clinics selected ? nothing else to do
                if (!clinicIds.Any())
                    return;

                // 2?? Insert or reactivate selected clinics
                const string upsertSql = @"
            INSERT INTO users_clinic_mapping (user_id, clinic_id, is_active, created_at, updated_at)
            VALUES (@UserId, @ClinicId, true, @CreatedAt, @UpdatedAt)
            ON CONFLICT (user_id, clinic_id)
            DO UPDATE SET
                is_active = true,
                updated_at = EXCLUDED.updated_at;
            ";

                var mappings = clinicIds.Select(clinicId => new
                {
                    UserId = userId,
                    ClinicId = clinicId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });

                await connection.ExecuteAsync(upsertSql, mappings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddUserClinicMappingsAsync: {ex.Message}");
                throw;
            }
        }



        public async Task<IEnumerable<UserClinicMapping>> GetUserClinicMappingsAsync(Guid userId)
        {
            try
            {
                const string sql = @"
                    SELECT
                        ucm.id AS Id,
                        ucm.user_id AS UserId,
                        ucm.clinic_id AS ClinicId,
                        c.name AS ClinicName,
                        ucm.is_active AS IsActive,
                        ucm.created_at AS CreatedAt,
                        ucm.updated_at AS UpdatedAt
                    FROM users_clinic_mapping ucm
                    LEFT JOIN clinics c ON ucm.clinic_id = c.id
                    WHERE ucm.user_id = @UserId AND ucm.is_active = true AND c.is_active = true
                    ORDER BY c.name";

                using var connection = _dbContext.GetConnection();
                return await connection.QueryAsync<UserClinicMapping>(sql, new { UserId = userId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserClinicMappingsAsync: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteUserClinicMappingsAsync(Guid userId)
        {
            try
            {
                // Soft delete: set is_active = false instead of deleting
                const string sql = "UPDATE users_clinic_mapping SET is_active = false, updated_at = @UpdatedAt WHERE user_id = @UserId AND is_active = true";
                using var connection = _dbContext.GetConnection();
                await connection.ExecuteAsync(sql, new { UserId = userId, UpdatedAt = DateTimeOffset.UtcNow });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteUserClinicMappingsAsync: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateLastLoginAsync(Guid userId, DateTimeOffset lastLogin)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    UPDATE users
                    SET last_login = @LastLogin
                    WHERE id = @UserId;";
                await connection.ExecuteAsync(sql, new { UserId = userId, LastLogin = lastLogin });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating last login for user {userId}: {ex.Message}");
                throw;
            }
        }

        public async Task<IEnumerable<(Guid ClinicId, string ClinicName, IEnumerable<UserDoctorSlot> Slots)>> GetUserSlotsByClinicAsync(Guid userId, Guid? clinicId = null)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                
                string sql = @"
                    SELECT 
                        uds.id,
                        uds.user_id,
                        uds.slot_id,
                        uds.clinic_id,
                        uds.created_at as uds_created_at,
                        uds.updated_at as uds_updated_at,
                        c.id as clinic_id_key,
                        c.name as clinic_name,
                        ds.day,
                        ds.start_time,
                        ds.end_time,
                        ds.created_at as ds_created_at,
                        ds.updated_at as ds_updated_at,
                        ds.is_active
                    FROM user_doctor_slot uds
                    LEFT JOIN clinics c ON uds.clinic_id = c.id
                    LEFT JOIN doctor_slot ds ON uds.slot_id = ds.id
                    WHERE uds.user_id = @UserId";

                var parameters = new DynamicParameters();
                parameters.Add("UserId", userId);

                if (clinicId.HasValue)
                {
                    sql += " AND uds.clinic_id = @ClinicId";
                    parameters.Add("ClinicId", clinicId.Value);
                }

                sql += " ORDER BY c.name NULLS LAST, ds.day, ds.start_time";

                var rawData = await connection.QueryAsync<dynamic>(sql, parameters);
                
                // Convert to list for grouping
                var dataList = rawData.ToList();

                // Group by clinic
                var grouped = dataList
                    .GroupBy(r => new 
                    { 
                        ClinicId = (Guid?)(r.clinic_id) ?? Guid.Empty,
                        ClinicName = (string)(r.clinic_name) ?? "No Clinic Assigned"
                    })
                    .Select(g => 
                    {
                        var slots = g.Select(r => new UserDoctorSlot
                        {
                            Id = (Guid)r.id,
                            UserId = (Guid)r.user_id,
                            SlotId = (Guid)r.slot_id,
                            ClinicId = (Guid?)r.clinic_id,
                            CreatedAt = (DateTime)r.uds_created_at,
                            UpdatedAt = (DateTime)r.uds_updated_at,
                            // Store slot details in extended properties from JOIN
                            Day = (string)r.day,
                            StartTime = (TimeSpan?)r.start_time,
                            EndTime = (TimeSpan?)r.end_time,
                            IsActive = (bool?)r.is_active,
                            SlotCreatedAt = (DateTime?)r.ds_created_at,
                            SlotUpdatedAt = (DateTime?)r.ds_updated_at
                        }).ToList();

                        return (
                            ClinicId: g.Key.ClinicId,
                            ClinicName: g.Key.ClinicName,
                            Slots: (IEnumerable<UserDoctorSlot>)slots
                        );
                    })
                    .ToList();

                return grouped;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserSlotsByClinicAsync: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                throw;
            }
        }
    }
}
