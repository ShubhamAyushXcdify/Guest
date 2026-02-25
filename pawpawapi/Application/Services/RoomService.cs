using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class RoomService : IRoomService
    {
        private readonly IRoomRepository _roomRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<RoomService> _logger;

        public RoomService(
            IRoomRepository roomRepository,
            IMapper mapper,
            ILogger<RoomService> logger)
        {
            _roomRepository = roomRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<RoomResponseDto?> GetByIdAsync(Guid id)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            return room == null ? null : _mapper.Map<RoomResponseDto>(room);
        }

        public async Task<PaginatedResponseDto<RoomResponseDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Guid? clinicId = null,
            bool paginationRequired = true)
        {
            try
            {
                var (rooms, totalCount) = await _roomRepository.GetAllAsync(
                    pageNumber,
                    pageSize,
                    clinicId,
                    paginationRequired);

                var dtos = _mapper.Map<IEnumerable<RoomResponseDto>>(rooms).ToList();

                return new PaginatedResponseDto<RoomResponseDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    PageNumber = paginationRequired ? pageNumber : 1,
                    PageSize = paginationRequired ? pageSize : totalCount,
                    TotalPages = paginationRequired ? (int)Math.Ceiling(totalCount / (double)pageSize) : 1,
                    HasPreviousPage = paginationRequired && pageNumber > 1,
                    HasNextPage = paginationRequired && pageNumber < (int)Math.Ceiling(totalCount / (double)pageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<IEnumerable<RoomResponseDto>> GetByClinicIdAsync(Guid clinicId)
        {
            try
            {
                var rooms = await _roomRepository.GetByClinicIdAsync(clinicId);
                return _mapper.Map<IEnumerable<RoomResponseDto>>(rooms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByClinicIdAsync");
                throw;
            }
        }

        public async Task<RoomResponseDto> CreateAsync(CreateRoomRequestDto dto)
        {
            var room = _mapper.Map<Room>(dto);
            var createdRoom = await _roomRepository.AddAsync(room);
            return _mapper.Map<RoomResponseDto>(createdRoom);
        }

        public async Task<RoomResponseDto> UpdateAsync(UpdateRoomRequestDto dto)
        {
            var room = _mapper.Map<Room>(dto);
            var updatedRoom = await _roomRepository.UpdateAsync(room);
            return _mapper.Map<RoomResponseDto>(updatedRoom);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _roomRepository.DeleteAsync(id);
        }
    }
}