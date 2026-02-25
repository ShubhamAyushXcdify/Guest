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
    public class DoctorSlotService : IDoctorSlotService
    {
        private readonly IDoctorSlotRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<DoctorSlotService> _logger;

        public DoctorSlotService(
            IDoctorSlotRepository repository,
            IMapper mapper,
            ILogger<DoctorSlotService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<DoctorSlotDto> GetDoctorSlotByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                var slot = await _repository.GetByIdAsync(id);
                if (slot == null)
                {
                    _logger.LogWarning("Doctor slot with id {Id} not found", id);
                    throw new InvalidOperationException("Doctor slot not found.");
                }

                return _mapper.Map<DoctorSlotDto>(slot);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDoctorSlotByIdAsync for doctor slot {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<DoctorSlotDto>> GetAllDoctorSlotsAsync()
        {
            try
            {
                var slots = await _repository.GetAllAsync();
                return _mapper.Map<IEnumerable<DoctorSlotDto>>(slots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllDoctorSlotsAsync for doctor slots");
                throw;
            }
        }

        public async Task<DoctorSlotDto> CreateDoctorSlotAsync(CreateDoctorSlotDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Doctor slot data cannot be null.");

                // Business logic validation
                await ValidateSlotBusinessRules(dto.Day, dto.StartTime, dto.EndTime);

                // Check for overlapping slots
                await ValidateNoOverlappingSlots(dto.Day, dto.StartTime, dto.EndTime);

                var slot = _mapper.Map<DoctorSlot>(dto);
                var created = await _repository.CreateAsync(slot);

                _logger.LogInformation("Doctor slot created successfully with id {Id}", created.Id);
                return _mapper.Map<DoctorSlotDto>(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateDoctorSlotAsync for doctor slot");
                throw;
            }
        }

        public async Task<DoctorSlotDto> UpdateDoctorSlotAsync(Guid id, UpdateDoctorSlotDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Doctor slot data cannot be null.");

                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                // Check if entity exists
                var existingSlot = await _repository.GetByIdAsync(id);
                if (existingSlot == null)
                    throw new KeyNotFoundException($"Doctor slot with ID {id} not found.");

                // Business logic validation for updated values
                var day = dto.Day ?? existingSlot.Day;
                var startTime = dto.StartTime ?? existingSlot.StartTime;
                var endTime = dto.EndTime ?? existingSlot.EndTime;

                await ValidateSlotBusinessRules(day, startTime, endTime);

                // Check for overlapping slots (excluding current slot)
                await ValidateNoOverlappingSlots(day, startTime, endTime, id);

                // Map the DTO to entity with the correct ID
                var slot = _mapper.Map<DoctorSlot>(dto);
                slot.Id = id;
                var updated = await _repository.UpdateAsync(slot);

                _logger.LogInformation("Doctor slot {Id} updated successfully", id);
                return _mapper.Map<DoctorSlotDto>(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateDoctorSlotAsync for doctor slot {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteDoctorSlotAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                // Check if entity exists
                var existingSlot = await _repository.GetByIdAsync(id);
                if (existingSlot == null)
                {
                    _logger.LogWarning("Doctor slot with id {Id} not found for deletion", id);
                    throw new KeyNotFoundException($"Doctor slot with ID {id} not found.");
                }

                var result = await _repository.DeleteAsync(id);
                _logger.LogInformation("Doctor slot {Id} deleted successfully", id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteDoctorSlotAsync for doctor slot {Id}", id);
                throw;
            }
        }

        // Private validation methods
        private async Task ValidateSlotBusinessRules(string day, TimeSpan startTime, TimeSpan endTime)
        {
            // Validate time range
            if (startTime >= endTime)
                throw new InvalidOperationException("Start time must be before end time.");

            // Validate reasonable time slots (e.g., between 6 AM and 11 PM)
            if (startTime < TimeSpan.FromHours(6) || endTime > TimeSpan.FromHours(23))
                throw new InvalidOperationException("Slot times must be between 6:00 AM and 11:00 PM.");

            // Validate minimum slot duration (e.g., at least 30 minutes)
            if (endTime - startTime < TimeSpan.FromMinutes(30))
                throw new InvalidOperationException("Slot duration must be at least 30 minutes.");

            // Validate maximum slot duration (e.g., no more than 8 hours)
            if (endTime - startTime > TimeSpan.FromHours(8))
                throw new InvalidOperationException("Slot duration cannot exceed 8 hours.");
        }

        private async Task ValidateNoOverlappingSlots(string day, TimeSpan startTime, TimeSpan endTime, Guid? excludeSlotId = null)
        {
            var allSlots = await _repository.GetAllAsync();

            foreach (var slot in allSlots)
            {
                // Skip the slot being updated
                if (excludeSlotId.HasValue && slot.Id == excludeSlotId.Value)
                    continue;

                // Check for same day and overlapping times
                if (slot.Day.Equals(day, StringComparison.OrdinalIgnoreCase))
                {
                    if ((startTime < slot.EndTime && endTime > slot.StartTime))
                    {
                        throw new InvalidOperationException(
                            $"Time slot overlaps with existing slot on {day} from {slot.StartTime} to {slot.EndTime}.");
                    }
                }
            }
        }
    }
}