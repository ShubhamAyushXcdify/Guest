using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<AppointmentRepository> _logger;

        public AppointmentRepository(DapperDbContext dbContext, ILogger<AppointmentRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Appointment> CreateAsync(Appointment appointment)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                appointment.Id = Guid.NewGuid();
                appointment.CreatedAt = DateTimeOffset.UtcNow;
                appointment.UpdatedAt = DateTimeOffset.UtcNow;

                var query = @"
INSERT INTO appointments
(id, clinic_id, company_id, patient_id, client_id, veterinarian_id, room_id, room_slot_id, appointment_date, appointment_type_id, reason, status, notes, is_registered, created_by, created_at, updated_at, appointment_time_from, appointment_time_to)
VALUES
(@Id, @ClinicId, @CompanyId, @PatientId, @ClientId, @VeterinarianId, @RoomId, @RoomSlotId, @AppointmentDate, @AppointmentTypeId, @Reason, @Status, @Notes, @IsRegistered, @CreatedBy, @CreatedAt, @UpdatedAt, @AppointmentTimeFrom, @AppointmentTimeTo)
RETURNING
    id AS Id,
    clinic_id AS ClinicId,
    company_id AS CompanyId,
    patient_id AS PatientId,
    client_id AS ClientId,
    veterinarian_id AS VeterinarianId,
    room_id AS RoomId,
    room_slot_id AS RoomSlotId,
    appointment_date AS AppointmentDate,
    appointment_type_id AS AppointmentTypeId,
    reason AS Reason,
    status AS Status,
    notes AS Notes,
    is_registered AS IsRegistered,
    created_by AS CreatedBy,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    appointment_time_from AS AppointmentTimeFrom,
    appointment_time_to AS AppointmentTimeTo;";

                var createdAppointment = await connection.QuerySingleAsync<Appointment>(query, appointment, transaction);
                transaction.Commit();
                return createdAppointment;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create appointment.", ex);
            }
        }

        public async Task<Appointment> GetByIdAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            var query = @"
SELECT
    id AS Id,
    clinic_id AS ClinicId,
    company_id AS CompanyId,
    patient_id AS PatientId,
    client_id AS ClientId,
    veterinarian_id AS VeterinarianId,
    room_id AS RoomId,
    room_slot_id AS RoomSlotId,
    appointment_date AS AppointmentDate,
    appointment_type_id AS AppointmentTypeId,
    reason AS Reason,
    status AS Status,
    notes AS Notes,
    is_registered AS IsRegistered,
    created_by AS CreatedBy,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    appointment_time_from AS AppointmentTimeFrom,
    appointment_time_to AS AppointmentTimeTo
FROM appointments
WHERE id = @Id;";

            return await connection.QuerySingleOrDefaultAsync<Appointment>(query, new { Id = id });
        }

        public async Task<(IEnumerable<Appointment> Items, int TotalCount)> GetAllAsync(
            int pageNumber,
            int pageSize,
            Guid? clinicId = null,
            Guid? patientId = null,
            Guid? clientId = null,
            Guid? veterinarianId = null,
            Guid? roomId = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            bool? isRegistered = null,
            Guid? companyId = null)
        {
            using var connection = _dbContext.GetConnection();

            var whereClauses = new List<string>();
            var parameters = new DynamicParameters();

            if (clinicId.HasValue)
            {
                whereClauses.Add("clinic_id = @ClinicId");
                parameters.Add("ClinicId", clinicId.Value);
            }

            if (patientId.HasValue)
            {
                whereClauses.Add("patient_id = @PatientId");
                parameters.Add("PatientId", patientId.Value);
            }

            if (clientId.HasValue)
            {
                whereClauses.Add("client_id = @ClientId");
                parameters.Add("ClientId", clientId.Value);
            }

            if (veterinarianId.HasValue)
            {
                whereClauses.Add("veterinarian_id = @VeterinarianId");
                parameters.Add("VeterinarianId", veterinarianId.Value);
            }

            if (roomId.HasValue)
            {
                whereClauses.Add("room_id = @RoomId");
                parameters.Add("RoomId", roomId.Value);
            }

            if (dateFrom.HasValue)
            {
                whereClauses.Add("appointment_date >= @DateFrom");
                parameters.Add("DateFrom", dateFrom.Value.Date);
            }

            if (dateTo.HasValue)
            {
                whereClauses.Add("appointment_date <= @DateTo");
                parameters.Add("DateTo", dateTo.Value.Date);
            }

            if (isRegistered.HasValue)
            {
                whereClauses.Add("is_registered = @IsRegistered");
                parameters.Add("IsRegistered", isRegistered.Value);
            }

            if (companyId.HasValue)
            {
                whereClauses.Add("company_id = @CompanyId");
                parameters.Add("CompanyId", companyId.Value);
            }

            var whereClause = whereClauses.Count > 0
                ? "WHERE " + string.Join(" AND ", whereClauses)
                : string.Empty;

            // Get total count with filters
            var countQuery = $"SELECT COUNT(*) FROM appointments {whereClause};";
            var totalCount = await connection.ExecuteScalarAsync<int>(countQuery, parameters);

            // Get paginated data with filters
            var query = $@"
SELECT
    id AS Id,
    clinic_id AS ClinicId,
    company_id AS CompanyId,
    patient_id AS PatientId,
    client_id AS ClientId,
    veterinarian_id AS VeterinarianId,
    room_id AS RoomId,
    room_slot_id AS RoomSlotId,
    appointment_date AS AppointmentDate,
    appointment_type_id AS AppointmentTypeId,
    reason AS Reason,
    status AS Status,
    notes AS Notes,
    is_registered AS IsRegistered,
    created_by AS CreatedBy,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    appointment_time_from AS AppointmentTimeFrom,
    appointment_time_to AS AppointmentTimeTo
FROM appointments
{whereClause}
ORDER BY created_at DESC
LIMIT @PageSize
OFFSET @Offset;";

            parameters.Add("PageSize", pageSize);
            parameters.Add("Offset", (pageNumber - 1) * pageSize);

            var appointments = await connection.QueryAsync<Appointment>(query, parameters);

            return (appointments, totalCount);
        }

        public async Task<Appointment> UpdateAsync(Appointment appointment)
        {
            using var connection = _dbContext.GetConnection();
            using var transaction = connection.BeginTransaction();
            try
            {
                appointment.UpdatedAt = DateTimeOffset.UtcNow;

                var query = @"
UPDATE appointments
SET
    clinic_id = @ClinicId,
    company_id = @CompanyId,
    patient_id = @PatientId,
    client_id = @ClientId,
    veterinarian_id = @VeterinarianId,
    room_id = @RoomId,
    room_slot_id = @RoomSlotId,
    appointment_date = @AppointmentDate,
    appointment_type_id = @AppointmentTypeId,
    reason = @Reason,
    status = @Status,
    notes = @Notes,
    is_registered = @IsRegistered,
    updated_at = @UpdatedAt,
    appointment_time_from = @AppointmentTimeFrom,
    appointment_time_to = @AppointmentTimeTo
WHERE id = @Id
RETURNING
    id AS Id,
    clinic_id AS ClinicId,
    company_id AS CompanyId,
    patient_id AS PatientId,
    client_id AS ClientId,
    veterinarian_id AS VeterinarianId,
    room_id AS RoomId,
    room_slot_id AS RoomSlotId,
    appointment_date AS AppointmentDate,
    appointment_type_id AS AppointmentTypeId,
    reason AS Reason,
    status AS Status,
    notes AS Notes,
    is_registered AS IsRegistered,
    created_by AS CreatedBy,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    appointment_time_from AS AppointmentTimeFrom,
    appointment_time_to AS AppointmentTimeTo;";

                var updatedAppointment = await connection.QuerySingleAsync<Appointment>(query, appointment, transaction);
                transaction.Commit();
                return updatedAppointment;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex, "Error in UpdateAsync");
                throw new InvalidOperationException("Failed to update appointment.", ex);
            }
        }


        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            var query = "DELETE FROM appointments WHERE id = @Id;";
            var rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
            return rowsAffected > 0;
        }

        public async Task<IEnumerable<Appointment>> GetByPatientIdAsync(Guid patientId)
        {
            using var connection = _dbContext.GetConnection();
            var query = @"
SELECT
    id AS Id,
    clinic_id AS ClinicId,
    company_id AS CompanyId,
    patient_id AS PatientId,
    client_id AS ClientId,
    veterinarian_id AS VeterinarianId,
    room_id AS RoomId,
    room_slot_id AS RoomSlotId,
    appointment_date AS AppointmentDate,
    appointment_type_id AS AppointmentTypeId,
    reason AS Reason,
    status AS Status,
    notes AS Notes,
    is_registered AS IsRegistered,
    created_by AS CreatedBy,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    appointment_time_from AS AppointmentTimeFrom,
    appointment_time_to AS AppointmentTimeTo
FROM appointments
WHERE patient_id = @PatientId
ORDER BY appointment_date DESC;";

            return await connection.QueryAsync<Appointment>(query, new { PatientId = patientId });
        }

        public async Task<IEnumerable<Appointment>> GetByClientIdWithFiltersAsync(Guid clientId, string status, DateTime? fromDate = null, DateTime? toDate = null)
        {
            using var connection = _dbContext.GetConnection();

            var whereClauses = new List<string>
            {
                "client_id = @ClientId"
            };

            var parameters = new DynamicParameters();
            parameters.Add("ClientId", clientId);

            if (!string.IsNullOrWhiteSpace(status))
            {
                whereClauses.Add("LOWER(status) = LOWER(@Status)");
                parameters.Add("Status", status);
            }

            if (fromDate.HasValue)
            {
                whereClauses.Add("appointment_date >= @FromDate");
                parameters.Add("FromDate", fromDate.Value.Date);
            }

            if (toDate.HasValue)
            {
                whereClauses.Add("appointment_date <= @ToDate");
                parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddSeconds(-1));
            }

            var whereClause = "WHERE " + string.Join(" AND ", whereClauses);

            var query = $@"
SELECT
    id AS Id,
    clinic_id AS ClinicId,
    company_id AS CompanyId,
    patient_id AS PatientId,
    client_id AS ClientId,
    veterinarian_id AS VeterinarianId,
    room_id AS RoomId,
    room_slot_id AS RoomSlotId,
    appointment_date AS AppointmentDate,
    appointment_type_id AS AppointmentTypeId,
    reason AS Reason,
    status AS Status,
    notes AS Notes,
    is_registered AS IsRegistered,
    created_by AS CreatedBy,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    appointment_time_from AS AppointmentTimeFrom,
    appointment_time_to AS AppointmentTimeTo
FROM appointments
{whereClause}
ORDER BY appointment_date DESC;";

            return await connection.QueryAsync<Appointment>(query, parameters);
        }

        public async Task<IEnumerable<Appointment>> GetByVeterinarianAndDateAsync(Guid veterinarianId, DateTime date)
        {
            using var connection = _dbContext.GetConnection();
            var query = @"
SELECT
    id AS Id,
    clinic_id AS ClinicId,
    company_id AS CompanyId,
    patient_id AS PatientId,
    client_id AS ClientId,
    veterinarian_id AS VeterinarianId,
    room_id AS RoomId,
    room_slot_id AS RoomSlotId,
    appointment_date AS AppointmentDate,
    appointment_type_id AS AppointmentTypeId,
    reason AS Reason,
    status AS Status,
    notes AS Notes,
    is_registered AS IsRegistered,
    created_by AS CreatedBy,
    created_at AS CreatedAt,
    updated_at AS UpdatedAt,
    appointment_time_from AS AppointmentTimeFrom,
    appointment_time_to AS AppointmentTimeTo
FROM appointments
WHERE veterinarian_id = @VeterinarianId AND appointment_date = @Date;";

            return await connection.QueryAsync<Appointment>(query, new { VeterinarianId = veterinarianId, Date = date.Date });
        }

        public async Task<IEnumerable<(Guid ProviderId, int Total, int Done, int Pending)>> GetProviderAppointmentCountsAsync(DateTime? fromDate, DateTime? toDate, Guid? clinicId = null)
        {
            using var connection = _dbContext.GetConnection();

            var whereClauses = new List<string>
            {
                "veterinarian_id IS NOT NULL"
            };

            var parameters = new DynamicParameters();

            if (fromDate.HasValue)
            {
                whereClauses.Add("appointment_date >= @FromDate");
                parameters.Add("FromDate", fromDate.Value.Date);
            }

            if (toDate.HasValue)
            {
                whereClauses.Add("appointment_date <= @ToDate");
                parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddSeconds(-1));
            }

            if (clinicId.HasValue)
            {
                whereClauses.Add("clinic_id = @ClinicId");
                parameters.Add("ClinicId", clinicId.Value);
            }

            var whereClause = "WHERE " + string.Join(" AND ", whereClauses);
            var query = $@"
SELECT
    veterinarian_id AS ProviderId,
    COUNT(*) AS Total,
    COUNT(*) FILTER (WHERE LOWER(status) = 'completed') AS Done,
    COUNT(*) FILTER (WHERE LOWER(status) IN ('scheduled', 'confirmed', 'in_progress')) AS Pending
FROM appointments
{whereClause}
GROUP BY veterinarian_id;";

            var results = await connection.QueryAsync<ProviderAppointmentCount>(query, parameters);

            return results
                .Where(r => r.ProviderId != Guid.Empty)
                .Select(r => (r.ProviderId, r.Total, r.Done, r.Pending))
                .ToList();
        }

    }

    public class ProviderAppointmentCount
    {
        public Guid ProviderId { get; set; }
        public int Total { get; set; }
        public int Done { get; set; }
        public int Pending { get; set; }
    }
}