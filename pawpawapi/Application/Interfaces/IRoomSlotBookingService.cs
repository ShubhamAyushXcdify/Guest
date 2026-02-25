using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IRoomSlotBookingService
    {
        Task<RoomSlotBookingDto> CreateAsync(CreateRoomSlotBookingRequestDto dto);
        Task<IEnumerable<RoomSlotBookingDto>> GetByRoomIdAndDateAsync(Guid roomId, DateTime date);
        Task<IEnumerable<RoomSlotBookingDto>> GetByClinicIdAndDateAsync(Guid clinicId, DateTime date);
        Task<IEnumerable<RoomSlotBookingDto>> GetByAppointmentIdAsync(Guid appointmentId);
        Task<RoomSlotBookingDto> UpdateAsync(RoomSlotBookingDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
} 