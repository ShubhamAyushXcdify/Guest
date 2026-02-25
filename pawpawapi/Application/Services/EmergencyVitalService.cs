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
    public class EmergencyVitalService : IEmergencyVitalService
    {
        private readonly IEmergencyVitalRepository _repository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<EmergencyVitalService> _logger;

        public EmergencyVitalService(
            IEmergencyVitalRepository repository,
            IVisitRepository visitRepository,
            IMapper mapper,
            ILogger<EmergencyVitalService> logger)
        {
            _repository = repository;
            _visitRepository = visitRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<EmergencyVitalResponseDto?> GetByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Emergency vital with id {Id} not found", id);
                    return null;
                }

                return _mapper.Map<EmergencyVitalResponseDto>(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for emergency vital {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<EmergencyVitalResponseDto>> GetAllAsync()
        {
            try
            {
                var entities = await _repository.GetAllAsync();
                return _mapper.Map<IEnumerable<EmergencyVitalResponseDto>>(entities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync for emergency vitals");
                throw;
            }
        }

        public async Task<IEnumerable<EmergencyVitalResponseDto>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    throw new ArgumentException("VisitId cannot be empty.", nameof(visitId));

                var entities = await _repository.GetByVisitIdAsync(visitId);
                return _mapper.Map<IEnumerable<EmergencyVitalResponseDto>>(entities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visitId {VisitId}", visitId);
                throw;
            }
        }

        public async Task<EmergencyVitalResponseDto> CreateAsync(CreateEmergencyVitalRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Emergency vital data cannot be null.");

                // Business logic validation
                await ValidateEmergencyVitalBusinessRules(dto);

                // Validate VisitId exists if provided
                if (dto.VisitId != Guid.Empty)
                {
                    var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                    if (visit == null)
                        throw new InvalidOperationException($"Visit with ID {dto.VisitId} not found.");
                }

                var entity = _mapper.Map<EmergencyVital>(dto);
                entity.Id = Guid.NewGuid();
                entity.CreatedAt = DateTime.UtcNow;
                entity.UpdatedAt = DateTime.UtcNow;

                await _repository.AddAsync(entity);

                // Update Visit's IsEmergencyVitalCompleted if VisitId is present
                if (dto.VisitId != Guid.Empty)
                {
                    var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                    if (visit != null)
                    {
                        visit.IsEmergencyVitalCompleted = dto.IsCompleted;
                        await _visitRepository.UpdateAsync(visit);
                    }
                }

                _logger.LogInformation("Emergency vital created successfully with id {Id}", entity.Id);
                return _mapper.Map<EmergencyVitalResponseDto>(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync for emergency vital");
                throw;
            }
        }

        public async Task<EmergencyVitalResponseDto> UpdateAsync(UpdateEmergencyVitalRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Emergency vital data cannot be null.");

                if (dto.Id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(dto.Id));

                // Check if entity exists
                var entity = await _repository.GetByIdAsync(dto.Id);
                if (entity == null)
                    throw new KeyNotFoundException($"Emergency vital with ID {dto.Id} not found.");

                // Business logic validation
                await ValidateEmergencyVitalBusinessRules(dto);

                // Validate VisitId exists if provided
                if (dto.VisitId != Guid.Empty)
                {
                    var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                    if (visit == null)
                        throw new InvalidOperationException($"Visit with ID {dto.VisitId} not found.");
                }

                _mapper.Map(dto, entity);
                entity.UpdatedAt = DateTime.UtcNow;
                await _repository.UpdateAsync(entity);

                // Update Visit's IsEmergencyVitalCompleted if VisitId is present
                if (dto.VisitId != Guid.Empty)
                {
                    var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                    if (visit != null)
                    {
                        visit.IsEmergencyVitalCompleted = dto.IsCompleted;
                        await _visitRepository.UpdateAsync(visit);
                    }
                }

                _logger.LogInformation("Emergency vital {Id} updated successfully", dto.Id);
                return _mapper.Map<EmergencyVitalResponseDto>(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for emergency vital {Id}", dto?.Id);
                throw;
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                // Check if entity exists
                var existingEntity = await _repository.GetByIdAsync(id);
                if (existingEntity == null)
                {
                    _logger.LogWarning("Emergency vital with id {Id} not found for deletion", id);
                    throw new KeyNotFoundException($"Emergency vital with ID {id} not found.");
                }

                // Update related visit status if needed
                if (existingEntity.VisitId != Guid.Empty)
                {
                    var visit = await _visitRepository.GetByIdAsync(existingEntity.VisitId);
                    if (visit != null)
                    {
                        visit.IsEmergencyVitalCompleted = false;
                        await _visitRepository.UpdateAsync(visit);
                    }
                }

                await _repository.DeleteAsync(id);
                _logger.LogInformation("Emergency vital {Id} deleted successfully", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for emergency vital {Id}", id);
                throw;
            }
        }

        // Private validation methods

        private async Task ValidateEmergencyVitalBusinessRules(CreateEmergencyVitalRequestDto dto)
        {
            // Validate vital signs ranges
            if (dto.TemperatureC.HasValue && (dto.TemperatureC < 32 || dto.TemperatureC > 43))
                throw new InvalidOperationException("Temperature must be between 32°C and 43°C.");

            if (dto.HeartRateBpm.HasValue && (dto.HeartRateBpm < 30 || dto.HeartRateBpm > 300))
                throw new InvalidOperationException("Heart rate must be between 30 and 300 BPM.");

            if (dto.RespiratoryRateBpm.HasValue && (dto.RespiratoryRateBpm < 5 || dto.RespiratoryRateBpm > 60))
                throw new InvalidOperationException("Respiratory rate must be between 5 and 60 breaths per minute.");

            if (dto.OxygenSaturationSpo2.HasValue && (dto.OxygenSaturationSpo2 < 70 || dto.OxygenSaturationSpo2 > 100))
                throw new InvalidOperationException("Oxygen saturation must be between 70% and 100%.");

            if (dto.WeightKg.HasValue && (dto.WeightKg < 0.1m || dto.WeightKg > 1000))
                throw new InvalidOperationException("Weight must be between 0.1 and 1000 kg.");

            if (dto.BloodGlucoseMgDl.HasValue && (dto.BloodGlucoseMgDl < 20 || dto.BloodGlucoseMgDl > 800))
                throw new InvalidOperationException("Blood glucose must be between 20 and 800 mg/dL.");

            if (dto.CapillaryRefillTimeSec.HasValue && (dto.CapillaryRefillTimeSec < 0 || dto.CapillaryRefillTimeSec > 10))
                throw new InvalidOperationException("Capillary refill time must be between 0 and 10 seconds.");

            await Task.CompletedTask; // For async consistency
        }

        private async Task ValidateEmergencyVitalBusinessRules(UpdateEmergencyVitalRequestDto dto)
        {
            // Validate vital signs ranges
            if (dto.TemperatureC.HasValue && (dto.TemperatureC < 32 || dto.TemperatureC > 43))
                throw new InvalidOperationException("Temperature must be between 32°C and 43°C.");

            if (dto.HeartRateBpm.HasValue && (dto.HeartRateBpm < 30 || dto.HeartRateBpm > 300))
                throw new InvalidOperationException("Heart rate must be between 30 and 300 BPM.");

            if (dto.RespiratoryRateBpm.HasValue && (dto.RespiratoryRateBpm < 5 || dto.RespiratoryRateBpm > 60))
                throw new InvalidOperationException("Respiratory rate must be between 5 and 60 breaths per minute.");

            if (dto.OxygenSaturationSpo2.HasValue && (dto.OxygenSaturationSpo2 < 70 || dto.OxygenSaturationSpo2 > 100))
                throw new InvalidOperationException("Oxygen saturation must be between 70% and 100%.");

            if (dto.WeightKg.HasValue && (dto.WeightKg < 0.1m || dto.WeightKg > 1000))
                throw new InvalidOperationException("Weight must be between 0.1 and 1000 kg.");

            if (dto.BloodGlucoseMgDl.HasValue && (dto.BloodGlucoseMgDl < 20 || dto.BloodGlucoseMgDl > 800))
                throw new InvalidOperationException("Blood glucose must be between 20 and 800 mg/dL.");

            if (dto.CapillaryRefillTimeSec.HasValue && (dto.CapillaryRefillTimeSec < 0 || dto.CapillaryRefillTimeSec > 10))
                throw new InvalidOperationException("Capillary refill time must be between 0 and 10 seconds.");

            await Task.CompletedTask; // For async consistency
        }
    }
}