using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class RoomSlotBookingService : IRoomSlotBookingService
    {
        private readonly IRoomSlotBookingRepository _repo;
        private readonly IMapper _mapper;
        private readonly ILogger<RoomSlotBookingService> _logger;

        public RoomSlotBookingService(IRoomSlotBookingRepository repo, IMapper mapper, ILogger<RoomSlotBookingService> logger)
        {
            _repo = repo;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<RoomSlotBookingDto> CreateAsync(CreateRoomSlotBookingRequestDto dto)
        {
            var booking = _mapper.Map<RoomSlotBooking>(dto);
            booking.IsBooked = true;
            var created = await _repo.CreateAsync(booking);
            return _mapper.Map<RoomSlotBookingDto>(created);
        }

        public async Task<IEnumerable<RoomSlotBookingDto>> GetByRoomIdAndDateAsync(Guid roomId, DateTime date)
        {
            var bookings = await _repo.GetByRoomIdAndDateAsync(roomId, date);
            return _mapper.Map<IEnumerable<RoomSlotBookingDto>>(bookings);
        }

        public async Task<IEnumerable<RoomSlotBookingDto>> GetByClinicIdAndDateAsync(Guid clinicId, DateTime date)
        {
            var bookings = await _repo.GetByClinicIdAndDateAsync(clinicId, date);
            return _mapper.Map<IEnumerable<RoomSlotBookingDto>>(bookings);
        }

        public async Task<IEnumerable<RoomSlotBookingDto>> GetByAppointmentIdAsync(Guid appointmentId)
        {
            var bookings = await _repo.GetByAppointmentIdAsync(appointmentId);
            return _mapper.Map<IEnumerable<RoomSlotBookingDto>>(bookings);
        }

        public async Task<RoomSlotBookingDto> UpdateAsync(RoomSlotBookingDto dto)
        {
            var booking = _mapper.Map<RoomSlotBooking>(dto);
            var updated = await _repo.UpdateAsync(booking);
            return _mapper.Map<RoomSlotBookingDto>(updated);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _repo.DeleteAsync(id);
        }
    }
} 