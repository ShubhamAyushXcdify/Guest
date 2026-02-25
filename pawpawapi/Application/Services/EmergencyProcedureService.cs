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
    public class EmergencyProcedureService : IEmergencyProcedureService
    {
        private readonly IEmergencyProcedureRepository _repository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<EmergencyProcedureService> _logger;

        public EmergencyProcedureService(
            IEmergencyProcedureRepository repository,
            IVisitRepository visitRepository,
            IMapper mapper,
            ILogger<EmergencyProcedureService> logger)
        {
            _repository = repository;
            _visitRepository = visitRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<EmergencyProcedureResponseDto?> GetByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Emergency procedure with id {Id} not found", id);
                    return null;
                }

                return _mapper.Map<EmergencyProcedureResponseDto>(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for emergency procedure {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<EmergencyProcedureResponseDto>> GetAllAsync()
        {
            try
            {
                var entities = await _repository.GetAllAsync();
                return _mapper.Map<IEnumerable<EmergencyProcedureResponseDto>>(entities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync for emergency procedures");
                throw;
            }
        }

        public async Task<IEnumerable<EmergencyProcedureResponseDto>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    throw new ArgumentException("VisitId cannot be empty.", nameof(visitId));

                var entities = await _repository.GetByVisitIdAsync(visitId);
                return _mapper.Map<IEnumerable<EmergencyProcedureResponseDto>>(entities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visitId {VisitId}", visitId);
                throw;
            }
        }

        public async Task<EmergencyProcedureResponseDto> CreateAsync(CreateEmergencyProcedureRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Emergency procedure data cannot be null.");

                // Business logic validation
                await ValidateEmergencyProcedureBusinessRules(dto);

                // Validate VisitId exists if provided
                if (dto.VisitId != Guid.Empty)
                {
                    var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                    if (visit == null)
                        throw new InvalidOperationException($"Visit with ID {dto.VisitId} not found.");
                }

                var entity = _mapper.Map<EmergencyProcedure>(dto);
                entity.Id = Guid.NewGuid();
                entity.CreatedAt = DateTime.UtcNow;
                entity.UpdatedAt = DateTime.UtcNow;

                await _repository.AddAsync(entity);

                if (dto.VisitId != Guid.Empty)
                {
                    var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                    if (visit != null)
                    {
                        visit.IsEmergencyProcedureCompleted = dto.IsCompleted;
                        await _visitRepository.UpdateAsync(visit);
                    }
                }

                _logger.LogInformation("Emergency procedure created successfully with id {Id}", entity.Id);
                return _mapper.Map<EmergencyProcedureResponseDto>(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync for emergency procedure");
                throw;
            }
        }

        public async Task<EmergencyProcedureResponseDto> UpdateAsync(UpdateEmergencyProcedureRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Emergency procedure data cannot be null.");

                if (dto.Id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(dto.Id));

                // Check if entity exists
                var entity = await _repository.GetByIdAsync(dto.Id);
                if (entity == null)
                    throw new KeyNotFoundException($"Emergency procedure with ID {dto.Id} not found.");

                // Business logic validation
                await ValidateEmergencyProcedureBusinessRules(dto);

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
                if (dto.VisitId != Guid.Empty)
                {
                    var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                    if (visit != null)
                    {
                        visit.IsEmergencyProcedureCompleted = dto.IsCompleted;
                        await _visitRepository.UpdateAsync(visit);
                    }
                }

                _logger.LogInformation("Emergency procedure {Id} updated successfully", dto.Id);
                return _mapper.Map<EmergencyProcedureResponseDto>(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for emergency procedure {Id}", dto?.Id);
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
                    _logger.LogWarning("Emergency procedure with id {Id} not found for deletion", id);
                    throw new KeyNotFoundException($"Emergency procedure with ID {id} not found.");
                }

                // Update related visit status if needed
                if (existingEntity.VisitId != Guid.Empty)
                {
                    var visit = await _visitRepository.GetByIdAsync(existingEntity.VisitId);
                    if (visit != null)
                    {
                        visit.IsEmergencyProcedureCompleted = false;
                        await _visitRepository.UpdateAsync(visit);
                    }
                }

                await _repository.DeleteAsync(id);
                _logger.LogInformation("Emergency procedure {Id} deleted successfully", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for emergency procedure {Id}", id);
                throw;
            }
        }

        // Private validation methods

        private async Task ValidateEmergencyProcedureBusinessRules(CreateEmergencyProcedureRequestDto dto)
        {
            // Validate procedure time is not in the future
            if (dto.ProcedureTime.HasValue && dto.ProcedureTime > DateTime.UtcNow.AddMinutes(5))
                throw new InvalidOperationException("Procedure time cannot be in the future.");

            // Validate procedure time is not too far in the past
            if (dto.ProcedureTime.HasValue && dto.ProcedureTime < DateTime.UtcNow.AddDays(-30))
                throw new InvalidOperationException("Procedure time cannot be more than 30 days in the past.");

 
            // Validate fluids if present
            if (dto.FluidsVolumeMl.HasValue && dto.FluidsVolumeMl <= 0)
                throw new InvalidOperationException("Fluids volume must be greater than 0.");

            await Task.CompletedTask; // For async consistency
        }

        private async Task ValidateEmergencyProcedureBusinessRules(UpdateEmergencyProcedureRequestDto dto)
        {
            // Validate procedure time is not in the future
            if (dto.ProcedureTime.HasValue && dto.ProcedureTime > DateTime.UtcNow.AddMinutes(5))
                throw new InvalidOperationException("Procedure time cannot be in the future.");

            // Validate procedure time is not too far in the past
            if (dto.ProcedureTime.HasValue && dto.ProcedureTime < DateTime.UtcNow.AddDays(-30))
                throw new InvalidOperationException("Procedure time cannot be more than 30 days in the past.");
       
            // Validate fluids if present
            if (dto.FluidsVolumeMl.HasValue && dto.FluidsVolumeMl <= 0)
                throw new InvalidOperationException("Fluids volume must be greater than 0.");

            await Task.CompletedTask; // For async consistency
        }
    }
}