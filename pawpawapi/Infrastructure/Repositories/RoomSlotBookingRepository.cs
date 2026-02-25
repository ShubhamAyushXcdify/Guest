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
    public class RoomSlotBookingRepository : IRoomSlotBookingRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<RoomSlotBookingRepository> _logger;

        public RoomSlotBookingRepository(DapperDbContext dbContext, ILogger<RoomSlotBookingRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<RoomSlotBooking> CreateAsync(RoomSlotBooking booking)
        {
            using var connection = _dbContext.GetConnection();
            if (booking.Id == Guid.Empty)
                booking.Id = Guid.NewGuid();
            booking.CreatedAt = DateTime.UtcNow;
            booking.UpdatedAt = DateTime.UtcNow;
            const string sql = @"INSERT INTO room_slot_bookings (id, room_slot_id, slot_date, is_booked, appointment_id, created_at, updated_at)
                                 VALUES (@Id, @RoomSlotId, @SlotDate, @IsBooked, @AppointmentId, @CreatedAt, @UpdatedAt)
                                 RETURNING *;";
            return await connection.QuerySingleAsync<RoomSlotBooking>(sql, booking);
        }

        public async Task<RoomSlotBooking?> GetByIdAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            const string sql = "SELECT * FROM room_slot_bookings WHERE id = @Id";
            return await connection.QueryFirstOrDefaultAsync<RoomSlotBooking>(sql, new { Id = id });
        }

        public async Task<IEnumerable<RoomSlotBooking>> GetByRoomIdAndDateAsync(Guid roomId, DateTime date)
        {
            using var connection = _dbContext.GetConnection();
            const string sql = @"SELECT b.* FROM room_slot_bookings b
                                 INNER JOIN room_slots s ON b.room_slot_id = s.id
                                 WHERE s.room_id = @RoomId AND b.slot_date = @Date
                                 ORDER BY b.created_at";
            return await connection.QueryAsync<RoomSlotBooking>(sql, new { RoomId = roomId, Date = date.Date });
        }

        public async Task<IEnumerable<RoomSlotBooking>> GetByClinicIdAndDateAsync(Guid clinicId, DateTime date)
        {
            using var connection = _dbContext.GetConnection();
            const string sql = @"SELECT b.* FROM room_slot_bookings b
                                 INNER JOIN room_slots s ON b.room_slot_id = s.id
                                 WHERE s.clinic_id = @ClinicId AND b.slot_date = @Date
                                 ORDER BY s.room_id, b.created_at";
            return await connection.QueryAsync<RoomSlotBooking>(sql, new { ClinicId = clinicId, Date = date.Date });
        }

        public async Task<IEnumerable<RoomSlotBooking>> GetByAppointmentIdAsync(Guid appointmentId)
        {
            using var connection = _dbContext.GetConnection();
            const string sql = "SELECT * FROM room_slot_bookings WHERE appointment_id = @AppointmentId";
            return await connection.QueryAsync<RoomSlotBooking>(sql, new { AppointmentId = appointmentId });
        }

        public async Task<RoomSlotBooking> UpdateAsync(RoomSlotBooking booking)
        {
            using var connection = _dbContext.GetConnection();
            booking.UpdatedAt = DateTime.UtcNow;
            const string sql = @"UPDATE room_slot_bookings SET room_slot_id = @RoomSlotId, slot_date = @SlotDate, is_booked = @IsBooked, appointment_id = @AppointmentId, updated_at = @UpdatedAt WHERE id = @Id RETURNING *;";
            return await connection.QuerySingleAsync<RoomSlotBooking>(sql, booking);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var connection = _dbContext.GetConnection();
            const string sql = "DELETE FROM room_slot_bookings WHERE id = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }
    }
} 