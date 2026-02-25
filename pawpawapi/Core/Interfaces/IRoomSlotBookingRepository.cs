using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IRoomSlotBookingRepository
    {
        Task<RoomSlotBooking> CreateAsync(RoomSlotBooking booking);
        Task<RoomSlotBooking?> GetByIdAsync(Guid id);
        Task<IEnumerable<RoomSlotBooking>> GetByRoomIdAndDateAsync(Guid roomId, DateTime date);
        Task<IEnumerable<RoomSlotBooking>> GetByClinicIdAndDateAsync(Guid clinicId, DateTime date);
        Task<IEnumerable<RoomSlotBooking>> GetByAppointmentIdAsync(Guid appointmentId);
        Task<RoomSlotBooking> UpdateAsync(RoomSlotBooking booking);
        Task<bool> DeleteAsync(Guid id);
    }
} 