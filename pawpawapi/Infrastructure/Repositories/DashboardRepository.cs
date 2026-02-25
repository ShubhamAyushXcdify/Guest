using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<DashboardRepository> _logger;

        public DashboardRepository(DapperDbContext dbContext, ILogger<DashboardRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<double?> GetAverageRatingByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (companyId.HasValue)
                {
                    whereClauses.Add("a.company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                // Only filter by date if both dates are provided (matching old behavior)
                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("a.appointment_date >= @FromDate");
                    whereClauses.Add("a.appointment_date <= @ToDate");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date);
                }

                var whereClause = whereClauses.Count > 0 
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                var query = $@"
                    SELECT AVG(r.rating)::numeric(10,2)
                    FROM ratings r
                    INNER JOIN appointments a ON r.appointment_id = a.id
                    {whereClause};";

                var result = await connection.QueryFirstOrDefaultAsync<double?>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAverageRatingByCompanyAsync");
                throw new InvalidOperationException("Failed to get average rating by company", ex);
            }
        }

        public async Task<double?> GetAverageRatingByClinicAsync(Guid? clinicId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (clinicId.HasValue)
                {
                    whereClauses.Add("a.clinic_id = @ClinicId");
                    parameters.Add("ClinicId", clinicId.Value);
                }

                // Only filter by date if both dates are provided (matching old behavior)
                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("a.appointment_date >= @FromDate");
                    whereClauses.Add("a.appointment_date <= @ToDate");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date);
                }

                var whereClause = whereClauses.Count > 0 
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                var query = $@"
                    SELECT AVG(r.rating)::numeric(10,2)
                    FROM ratings r
                    INNER JOIN appointments a ON r.appointment_id = a.id
                    {whereClause};";

                var result = await connection.QueryFirstOrDefaultAsync<double?>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAverageRatingByClinicAsync");
                throw new InvalidOperationException("Failed to get average rating by clinic", ex);
            }
        }

        public async Task<int> GetVeterinarianCountByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                whereClauses.Add("ucm.clinic_id = @ClinicId");
                parameters.Add("ClinicId", clinicId);

                whereClauses.Add("LOWER(r.value) = 'veterinarian'");
                
                // Only filter by date if both dates are provided (matching old behavior)
                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(u.created_at IS NULL OR (u.created_at >= @FromDate AND u.created_at <= @ToDate))");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = "WHERE " + string.Join(" AND ", whereClauses);

                var query = $@"
                    SELECT COUNT(DISTINCT u.id)
                    FROM users u
                    INNER JOIN users_clinic_mapping ucm ON u.id = ucm.user_id
                    INNER JOIN roles r ON u.role_id = r.id
                    {whereClause};";

                var result = await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetVeterinarianCountByClinicAsync");
                throw new InvalidOperationException("Failed to get veterinarian count by clinic", ex);
            }
        }

        public async Task<int> GetPatientCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (companyId.HasValue)
                {
                    whereClauses.Add("company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                // Only filter by date if both dates are provided (matching old behavior)
                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(created_at IS NULL OR (created_at >= @FromDate AND created_at <= @ToDate))");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = whereClauses.Count > 0 
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                var query = $@"
                    SELECT COUNT(*)
                    FROM patients
                    {whereClause};";

                var result = await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPatientCountByCompanyAsync");
                throw new InvalidOperationException("Failed to get patient count by company", ex);
            }
        }

        public async Task<int> GetClientCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (companyId.HasValue)
                {
                    whereClauses.Add("company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                // Only filter by date if both dates are provided (matching old behavior)
                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(created_at IS NULL OR (created_at >= @FromDate AND created_at <= @ToDate))");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = whereClauses.Count > 0 
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                var query = $@"
                    SELECT COUNT(*)
                    FROM clients
                    {whereClause};";

                var result = await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetClientCountByCompanyAsync");
                throw new InvalidOperationException("Failed to get client count by company", ex);
            }
        }

        public async Task<int> GetNewClientCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();

                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (companyId.HasValue)
                {
                    whereClauses.Add("company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                // Only filter by date if both dates are provided (matching existing dashboard behavior)
                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(created_at IS NOT NULL AND created_at >= @FromDate AND created_at <= @ToDate)");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = whereClauses.Count > 0
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                var query = $@"
                    SELECT COUNT(*)
                    FROM clients
                    {whereClause};";

                return await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetNewClientCountByCompanyAsync");
                throw new InvalidOperationException("Failed to get new client count by company", ex);
            }
        }

        public async Task<int> GetMovedOutClientCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();

                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (companyId.HasValue)
                {
                    whereClauses.Add("company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                // "Moved out" interpreted as deactivated clients (is_active = false)
                whereClauses.Add("COALESCE(is_active, true) = false");

                // Only filter by date if both dates are provided (matching existing dashboard behavior)
                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(updated_at IS NOT NULL AND updated_at >= @FromDate AND updated_at <= @ToDate)");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = whereClauses.Count > 0
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                var query = $@"
                    SELECT COUNT(*)
                    FROM clients
                    {whereClause};";

                return await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetMovedOutClientCountByCompanyAsync");
                throw new InvalidOperationException("Failed to get moved out client count by company", ex);
            }
        }

        public async Task<int> GetNewClientCountByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();

                var whereClauses = new List<string>
                {
                    "a.clinic_id = @ClinicId"
                };
                var parameters = new DynamicParameters();
                parameters.Add("ClinicId", clinicId);

                // Only filter by date if both dates are provided
                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(c.created_at IS NOT NULL AND c.created_at >= @FromDate AND c.created_at <= @ToDate)");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", fromDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = "WHERE " + string.Join(" AND ", whereClauses);

                var query = $@"
                    SELECT COUNT(DISTINCT c.id)
                    FROM clients c
                    INNER JOIN appointments a ON a.client_id = c.id
                    {whereClause};";

                return await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetNewClientCountByClinicAsync");
                throw new InvalidOperationException("Failed to get new client count by clinic", ex);
            }
        }

        public async Task<int> GetMovedOutClientCountByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();

                var whereClauses = new List<string>
                {
                    "a.clinic_id = @ClinicId",
                    "COALESCE(c.is_active, true) = false"
                };
                var parameters = new DynamicParameters();
                parameters.Add("ClinicId", clinicId);

                // Only filter by date if both dates are provided
                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(c.updated_at IS NOT NULL AND c.updated_at >= @FromDate AND c.updated_at <= @ToDate)");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", fromDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = "WHERE " + string.Join(" AND ", whereClauses);

                var query = $@"
                    SELECT COUNT(DISTINCT c.id)
                    FROM clients c
                    INNER JOIN appointments a ON a.client_id = c.id
                    {whereClause};";

                return await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetMovedOutClientCountByClinicAsync");
                throw new InvalidOperationException("Failed to get moved out client count by clinic", ex);
            }
        }

        public async Task<int> GetActiveClientCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (companyId.HasValue)
                {
                    whereClauses.Add("company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                whereClauses.Add("is_active = true");

                if (fromDate.HasValue)
                {
                    whereClauses.Add("created_at >= @FromDate");
                    parameters.Add("FromDate", fromDate.Value.Date);
                }

                if (toDate.HasValue)
                {
                    whereClauses.Add("created_at <= @ToDate");
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = "WHERE " + string.Join(" AND ", whereClauses);

                var query = $@"
                    SELECT COUNT(*)
                    FROM clients
                    {whereClause};";

                var result = await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetActiveClientCountByCompanyAsync");
                throw new InvalidOperationException("Failed to get active client count by company", ex);
            }
        }

        public async Task<int> GetPendingRegistrationCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (companyId.HasValue)
                {
                    whereClauses.Add("company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                whereClauses.Add("(is_active IS NULL OR is_active = false)");

                if (fromDate.HasValue)
                {
                    whereClauses.Add("created_at >= @FromDate");
                    parameters.Add("FromDate", fromDate.Value.Date);
                }

                if (toDate.HasValue)
                {
                    whereClauses.Add("created_at <= @ToDate");
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = "WHERE " + string.Join(" AND ", whereClauses);

                var query = $@"
                    SELECT COUNT(*)
                    FROM clients
                    {whereClause};";

                var result = await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPendingRegistrationCountByCompanyAsync");
                throw new InvalidOperationException("Failed to get pending registration count by company", ex);
            }
        }

        public async Task<int> GetProductCountByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (companyId.HasValue)
                {
                    whereClauses.Add("company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                // Only filter by date if both dates are provided (matching old behavior)
                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(created_at IS NULL OR (created_at >= @FromDate AND created_at <= @ToDate))");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = whereClauses.Count > 0 
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                var query = $@"
                    SELECT COUNT(*)
                    FROM products
                    {whereClause};";

                var result = await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProductCountByCompanyAsync");
                throw new InvalidOperationException("Failed to get product count by company", ex);
            }
        }

        public async Task<int> GetSupplierCountByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                whereClauses.Add("clinic_id = @ClinicId");
                parameters.Add("ClinicId", clinicId);

                if (fromDate.HasValue)
                {
                    whereClauses.Add("created_at >= @FromDate");
                    parameters.Add("FromDate", fromDate.Value.Date);
                }

                if (toDate.HasValue)
                {
                    whereClauses.Add("created_at <= @ToDate");
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = "WHERE " + string.Join(" AND ", whereClauses);

                var query = $@"
                    SELECT COUNT(*)
                    FROM suppliers
                    {whereClause};";

                var result = await connection.QueryFirstOrDefaultAsync<int>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetSupplierCountByClinicAsync");
                throw new InvalidOperationException("Failed to get supplier count by clinic", ex);
            }
        }

        public async Task<IReadOnlyList<SuperAdminDashboardRow>> GetSuperAdminDashboardSingleQueryAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var parameters = new DynamicParameters();
                if (fromDate.HasValue) parameters.Add("FromDate", fromDate.Value.Date);
                if (toDate.HasValue) parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));

                var adminDateFilter = fromDate.HasValue && toDate.HasValue
                    ? " AND u.created_at >= @FromDate AND u.created_at <= @ToDate"
                    : "";
                var patientDateFilter = fromDate.HasValue && toDate.HasValue
                    ? " AND (p.created_at IS NULL OR (p.created_at >= @FromDate AND p.created_at <= @ToDate))"
                    : "";
                var clientDateFilter = fromDate.HasValue && toDate.HasValue
                    ? " AND (c2.created_at IS NULL OR (c2.created_at >= @FromDate AND c2.created_at <= @ToDate))"
                    : "";
                var productDateFilter = fromDate.HasValue && toDate.HasValue
                    ? " AND (pr.created_at IS NULL OR (pr.created_at >= @FromDate AND pr.created_at <= @ToDate))"
                    : "";
                var vetDateFilter = fromDate.HasValue && toDate.HasValue
                    ? " AND (u2.created_at IS NULL OR (u2.created_at >= @FromDate AND u2.created_at <= @ToDate))"
                    : "";
                var supplierDateFilter = "";
                if (fromDate.HasValue) supplierDateFilter += " AND s.created_at >= @FromDate";
                if (toDate.HasValue) supplierDateFilter += " AND s.created_at <= @ToDate";
                var apptDateFilter = "";
                if (fromDate.HasValue) apptDateFilter += " AND a.appointment_date >= @FromDate";
                if (toDate.HasValue) apptDateFilter += " AND a.appointment_date <= @ToDate";

                var query = $@"
WITH company_admins AS (
    SELECT u.company_id AS company_id, COUNT(DISTINCT u.id) AS cnt
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    WHERE LOWER(r.value) = 'admin' AND u.company_id IS NOT NULL {adminDateFilter}
    GROUP BY u.company_id
),
company_last_login AS (
    WITH expanded AS (
        SELECT u.last_login, u.company_id AS cid FROM users u WHERE u.last_login IS NOT NULL AND u.company_id IS NOT NULL
        UNION ALL
        SELECT u.last_login, cl2.company_id AS cid
        FROM users u
        INNER JOIN users_clinic_mapping ucm ON ucm.user_id = u.id
        INNER JOIN clinics cl2 ON cl2.id = ucm.clinic_id
        WHERE u.last_login IS NOT NULL
    )
    SELECT cid AS company_id, MAX(last_login) AS last_login_at FROM expanded GROUP BY cid
),
company_patients AS (
    SELECT p.company_id AS company_id, COUNT(*) AS cnt FROM patients p WHERE 1=1 {patientDateFilter}
    GROUP BY p.company_id
),
company_clients AS (
    SELECT c2.company_id AS company_id, COUNT(*) AS cnt FROM clients c2 WHERE 1=1 {clientDateFilter}
    GROUP BY c2.company_id
),
company_products AS (
    SELECT pr.company_id AS company_id, COUNT(*) AS cnt FROM products pr WHERE 1=1 {productDateFilter}
    GROUP BY pr.company_id
),
clinic_vets AS (
    SELECT ucm.clinic_id AS clinic_id, COUNT(DISTINCT u2.id) AS cnt
    FROM users u2
    INNER JOIN users_clinic_mapping ucm ON u2.id = ucm.user_id
    INNER JOIN roles r2 ON u2.role_id = r2.id
    WHERE LOWER(r2.value) = 'veterinarian' {vetDateFilter}
    GROUP BY ucm.clinic_id
),
clinic_suppliers AS (
    SELECT s.clinic_id AS clinic_id, COUNT(*) AS cnt FROM suppliers s WHERE 1=1 {supplierDateFilter}
    GROUP BY s.clinic_id
),
clinic_appts AS (
    SELECT a.clinic_id AS clinic_id,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE LOWER(a.status) = 'completed') AS completed,
        COUNT(*) FILTER (WHERE LOWER(a.status) = 'cancelled') AS canceled
    FROM appointments a WHERE 1=1 {apptDateFilter}
    GROUP BY a.clinic_id
)
SELECT
    c.id AS CompanyId,
    c.name AS CompanyName,
    cl.id AS ClinicId,
    cl.name AS ClinicName,
    COALESCE(ca.cnt, 0)::int AS AdminCount,
    cll.last_login_at AS LastLoginAt,
    COALESCE(cp.cnt, 0)::int AS PatientCount,
    COALESCE(cc.cnt, 0)::int AS ClientCount,
    COALESCE(cpr.cnt, 0)::int AS ProductCount,
    COALESCE(cv.cnt, 0)::int AS VetCount,
    COALESCE(cs.cnt, 0)::int AS SupplierCount,
    COALESCE(apt.total, 0)::int AS TotalAppointments,
    COALESCE(apt.completed, 0)::int AS CompletedAppointments,
    COALESCE(apt.canceled, 0)::int AS CanceledAppointments
FROM company c
LEFT JOIN clinics cl ON cl.company_id = c.id
LEFT JOIN company_admins ca ON ca.company_id = c.id
LEFT JOIN company_last_login cll ON cll.company_id = c.id
LEFT JOIN company_patients cp ON cp.company_id = c.id
LEFT JOIN company_clients cc ON cc.company_id = c.id
LEFT JOIN company_products cpr ON cpr.company_id = c.id
LEFT JOIN clinic_vets cv ON cv.clinic_id = cl.id
LEFT JOIN clinic_suppliers cs ON cs.clinic_id = cl.id
LEFT JOIN clinic_appts apt ON apt.clinic_id = cl.id
WHERE c.is_active = true
ORDER BY c.id, cl.id NULLS LAST;";

                using var connection = await _dbContext.CreateConnectionAsync();
                var rows = await connection.QueryAsync<SuperAdminDashboardRow>(query, parameters);
                return rows.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetSuperAdminDashboardSingleQueryAsync");
                throw new InvalidOperationException("Failed to get super-admin dashboard in single query", ex);
            }
        }

        public async Task<(int Total, int Completed, int Canceled)> GetAppointmentStatisticsByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                whereClauses.Add("clinic_id = @ClinicId");
                parameters.Add("ClinicId", clinicId);

                if (fromDate.HasValue)
                {
                    whereClauses.Add("appointment_date >= @FromDate");
                    parameters.Add("FromDate", fromDate.Value.Date);
                }

                if (toDate.HasValue)
                {
                    whereClauses.Add("appointment_date <= @ToDate");
                    parameters.Add("ToDate", toDate.Value.Date);
                }

                var whereClause = "WHERE " + string.Join(" AND ", whereClauses);

                var query = $@"
                    SELECT 
                        COUNT(*) as Total,
                        COUNT(*) FILTER (WHERE LOWER(status) = 'completed') as Completed,
                        COUNT(*) FILTER (WHERE LOWER(status) = 'cancelled') as Canceled
                    FROM appointments
                    {whereClause};";

                var result = await connection.QueryFirstOrDefaultAsync<(int Total, int Completed, int Canceled)>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAppointmentStatisticsByClinicAsync");
                throw new InvalidOperationException("Failed to get appointment statistics by clinic", ex);
            }
        }

        public async Task<decimal> GetServiceProfitByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                if (companyId.HasValue)
                {
                    whereClauses.Add("c.company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR (vi.created_at >= @FromDate AND vi.created_at <= @ToDate))");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }
                else if (fromDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR vi.created_at >= @FromDate)");
                    parameters.Add("FromDate", fromDate.Value.Date);
                }
                else if (toDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR vi.created_at <= @ToDate)");
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = whereClauses.Count > 0 
                    ? "WHERE " + string.Join(" AND ", whereClauses)
                    : string.Empty;

                var query = $@"
                    SELECT COALESCE(SUM(vi.consultation_fee_after_discount), 0)
                    FROM visit_invoices vi
                    INNER JOIN clinics c ON vi.clinic_id = c.id
                    {whereClause};";

                var result = await connection.ExecuteScalarAsync<decimal>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetServiceProfitByCompanyAsync for company {CompanyId}", companyId);
                throw new InvalidOperationException($"Failed to get service profit for company {companyId}", ex);
            }
        }

        public async Task<decimal> GetProductProfitByCompanyAsync(Guid? companyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                whereClauses.Add("vip.is_given = true");

                if (companyId.HasValue)
                {
                    whereClauses.Add("c.company_id = @CompanyId");
                    parameters.Add("CompanyId", companyId.Value);
                }

                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR (vi.created_at >= @FromDate AND vi.created_at <= @ToDate))");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }
                else if (fromDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR vi.created_at >= @FromDate)");
                    parameters.Add("FromDate", fromDate.Value.Date);
                }
                else if (toDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR vi.created_at <= @ToDate)");
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = "WHERE " + string.Join(" AND ", whereClauses);

                var query = $@"
                    SELECT COALESCE(SUM((COALESCE(p.selling_price, 0) - COALESCE(p.price, 0)) * vip.quantity), 0)
                    FROM visit_invoice_products vip
                    INNER JOIN visit_invoices vi ON vip.visit_invoice_id = vi.id
                    INNER JOIN clinics c ON vi.clinic_id = c.id
                    INNER JOIN purchase_order_receiving_history porh ON vip.purchase_order_receiving_history_id = porh.id
                    INNER JOIN products p ON porh.product_id = p.id
                    {whereClause};";

                var result = await connection.ExecuteScalarAsync<decimal>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProductProfitByCompanyAsync for company {CompanyId}", companyId);
                throw new InvalidOperationException($"Failed to get product profit for company {companyId}", ex);
            }
        }

        public async Task<decimal> GetServiceProfitByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                whereClauses.Add("vi.clinic_id = @ClinicId");
                parameters.Add("ClinicId", clinicId);

                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR (vi.created_at >= @FromDate AND vi.created_at <= @ToDate))");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }
                else if (fromDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR vi.created_at >= @FromDate)");
                    parameters.Add("FromDate", fromDate.Value.Date);
                }
                else if (toDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR vi.created_at <= @ToDate)");
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = "WHERE " + string.Join(" AND ", whereClauses);

                var query = $@"
                    SELECT COALESCE(SUM(vi.consultation_fee_after_discount), 0)
                    FROM visit_invoices vi
                    {whereClause};";

                var result = await connection.ExecuteScalarAsync<decimal>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetServiceProfitByClinicAsync for clinic {ClinicId}", clinicId);
                throw new InvalidOperationException($"Failed to get service profit for clinic {clinicId}", ex);
            }
        }

        public async Task<decimal> GetProductProfitByClinicAsync(Guid clinicId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var whereClauses = new List<string>();
                var parameters = new DynamicParameters();

                whereClauses.Add("vip.is_given = true");
                whereClauses.Add("vi.clinic_id = @ClinicId");
                parameters.Add("ClinicId", clinicId);

                if (fromDate.HasValue && toDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR (vi.created_at >= @FromDate AND vi.created_at <= @ToDate))");
                    parameters.Add("FromDate", fromDate.Value.Date);
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }
                else if (fromDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR vi.created_at >= @FromDate)");
                    parameters.Add("FromDate", fromDate.Value.Date);
                }
                else if (toDate.HasValue)
                {
                    whereClauses.Add("(vi.created_at IS NULL OR vi.created_at <= @ToDate)");
                    parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddTicks(-1));
                }

                var whereClause = "WHERE " + string.Join(" AND ", whereClauses);

                var query = $@"
                    SELECT COALESCE(SUM((COALESCE(p.selling_price, 0) - COALESCE(p.price, 0)) * vip.quantity), 0)
                    FROM visit_invoice_products vip
                    INNER JOIN visit_invoices vi ON vip.visit_invoice_id = vi.id
                    INNER JOIN purchase_order_receiving_history porh ON vip.purchase_order_receiving_history_id = porh.id
                    INNER JOIN products p ON porh.product_id = p.id
                    {whereClause};";

                var result = await connection.ExecuteScalarAsync<decimal>(query, parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetProductProfitByClinicAsync for clinic {ClinicId}", clinicId);
                throw new InvalidOperationException($"Failed to get product profit for clinic {clinicId}", ex);
            }
        }

        public async Task<IEnumerable<(DateTime WeekStart, DateTime WeekEnd, decimal ServiceProfit, decimal ProductProfit)>> GetWeeklyProfitByClinicAsync(Guid clinicId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                using var connection = await _dbContext.CreateConnectionAsync();
                
                var parameters = new DynamicParameters();
                parameters.Add("ClinicId", clinicId);
                parameters.Add("FromDate", fromDate.Date);
                parameters.Add("ToDate", toDate.Date.AddDays(1).AddTicks(-1));

                // Query to get service profit grouped by week
                var serviceProfitQuery = @"
                    SELECT 
                        DATE_TRUNC('week', vi.created_at)::date as week_start,
                        (DATE_TRUNC('week', vi.created_at) + INTERVAL '6 days')::date as week_end,
                        COALESCE(SUM(vi.consultation_fee_after_discount), 0) as service_profit
                    FROM visit_invoices vi
                    WHERE vi.clinic_id = @ClinicId
                        AND vi.created_at >= @FromDate
                        AND vi.created_at <= @ToDate
                    GROUP BY DATE_TRUNC('week', vi.created_at)
                    ORDER BY week_start";

                // Query to get product profit grouped by week
                var productProfitQuery = @"
                    SELECT 
                        DATE_TRUNC('week', vi.created_at)::date as week_start,
                        (DATE_TRUNC('week', vi.created_at) + INTERVAL '6 days')::date as week_end,
                        COALESCE(SUM((COALESCE(p.selling_price, 0) - COALESCE(p.price, 0)) * vip.quantity), 0) as product_profit
                    FROM visit_invoice_products vip
                    INNER JOIN visit_invoices vi ON vip.visit_invoice_id = vi.id
                    INNER JOIN purchase_order_receiving_history porh ON vip.purchase_order_receiving_history_id = porh.id
                    INNER JOIN products p ON porh.product_id = p.id
                    WHERE vip.is_given = true
                        AND vi.clinic_id = @ClinicId
                        AND vi.created_at >= @FromDate
                        AND vi.created_at <= @ToDate
                    GROUP BY DATE_TRUNC('week', vi.created_at)
                    ORDER BY week_start";

                // Get service profits by week
                var serviceProfits = await connection.QueryAsync<(DateTime WeekStart, DateTime WeekEnd, decimal ServiceProfit)>(serviceProfitQuery, parameters);
                
                // Get product profits by week
                var productProfits = await connection.QueryAsync<(DateTime WeekStart, DateTime WeekEnd, decimal ProductProfit)>(productProfitQuery, parameters);

                // Combine both results into a dictionary keyed by week_start
                var weeklyData = new Dictionary<DateTime, (DateTime WeekStart, DateTime WeekEnd, decimal ServiceProfit, decimal ProductProfit)>();

                // Add service profits
                foreach (var item in serviceProfits)
                {
                    weeklyData[item.WeekStart] = (item.WeekStart, item.WeekEnd, item.ServiceProfit, 0);
                }

                // Add/update product profits
                foreach (var item in productProfits)
                {
                    if (weeklyData.ContainsKey(item.WeekStart))
                    {
                        var existing = weeklyData[item.WeekStart];
                        weeklyData[item.WeekStart] = (existing.WeekStart, existing.WeekEnd, existing.ServiceProfit, item.ProductProfit);
                    }
                    else
                    {
                        weeklyData[item.WeekStart] = (item.WeekStart, item.WeekEnd, 0, item.ProductProfit);
                    }
                }

                // Generate all weeks in the date range (even if no data)
                var allWeeks = new List<(DateTime WeekStart, DateTime WeekEnd, decimal ServiceProfit, decimal ProductProfit)>();
                var currentWeekStart = fromDate.Date;
                
                // Adjust to start of week (Monday)
                var daysFromMonday = ((int)currentWeekStart.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
                currentWeekStart = currentWeekStart.AddDays(-daysFromMonday);

                while (currentWeekStart <= toDate)
                {
                    var weekEnd = currentWeekStart.AddDays(6);
                    
                    if (weeklyData.ContainsKey(currentWeekStart))
                    {
                        allWeeks.Add(weeklyData[currentWeekStart]);
                    }
                    else
                    {
                        allWeeks.Add((currentWeekStart, weekEnd, 0, 0));
                    }
                    
                    currentWeekStart = currentWeekStart.AddDays(7);
                }

                return allWeeks.OrderBy(w => w.WeekStart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetWeeklyProfitByClinicAsync for clinic {ClinicId}", clinicId);
                throw new InvalidOperationException($"Failed to get weekly profit for clinic {clinicId}", ex);
            }
        }
    }
}

