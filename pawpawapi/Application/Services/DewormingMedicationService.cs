using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class DewormingMedicationService : IDewormingMedicationService
    {
        private readonly IDewormingMedicationRepository _repository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<DewormingMedicationService> _logger;

        public DewormingMedicationService(
            IDewormingMedicationRepository repository,
            IVisitRepository visitRepository,
            IMapper mapper,
            ILogger<DewormingMedicationService> logger)
        {
            _repository = repository;
            _visitRepository = visitRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<DewormingMedicationResponseDto?> GetByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Deworming medication with id {Id} not found", id);
                    return null;
                }

                return _mapper.Map<DewormingMedicationResponseDto>(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for deworming medication {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<DewormingMedicationResponseDto>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    throw new ArgumentException("Visit ID cannot be empty.", nameof(visitId));

                var entities = await _repository.GetByVisitIdAsync(visitId);
                return _mapper.Map<IEnumerable<DewormingMedicationResponseDto>>(entities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for deworming medication with visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<DewormingMedicationResponseDto> CreateAsync(CreateDewormingMedicationRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Deworming medication data cannot be null.");

                // Validate visit exists
                var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                if (visit == null)
                    throw new InvalidOperationException($"Visit with ID {dto.VisitId} not found.");

                // Check if data already exists for this visitId
                var existingData = await _repository.GetByVisitIdAsync(dto.VisitId);
                if (existingData != null && existingData.Any())
                {
                    throw new InvalidOperationException($"Deworming medication data for visit ID {dto.VisitId} already exists. Cannot create duplicate records.");
                }

                var entity = _mapper.Map<DewormingMedication>(dto);
                var created = await _repository.CreateAsync(entity);

                // Update Visit's is_deworming_medication_completed
                visit.IsDewormingMedicationCompleted = created.IsCompleted;
                await _visitRepository.UpdateAsync(visit);

                return _mapper.Map<DewormingMedicationResponseDto>(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync for deworming medication with visit {VisitId}", dto?.VisitId);
                throw;
            }
        }

        public async Task<DewormingMedicationResponseDto> UpdateAsync(UpdateDewormingMedicationRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Deworming medication data cannot be null.");

                if (dto.Id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(dto.Id));

                // Check if entity exists
                var existingEntity = await _repository.GetByIdAsync(dto.Id);
                if (existingEntity == null)
                    throw new KeyNotFoundException($"Deworming medication with ID {dto.Id} not found.");

                // Map the DTO to entity but preserve the VisitId from existing entity
                var entity = _mapper.Map<DewormingMedication>(dto);
                entity.VisitId = existingEntity.VisitId; // Preserve VisitId from existing record
                
                var updated = await _repository.UpdateAsync(entity);

                // Update Visit's is_deworming_medication_completed
                var visit = await _visitRepository.GetByIdAsync(updated.VisitId);
                if (visit != null)
                {
                    visit.IsDewormingMedicationCompleted = updated.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }

                return _mapper.Map<DewormingMedicationResponseDto>(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for deworming medication {Id}", dto?.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                // Check if entity exists
                var existingEntity = await _repository.GetByIdAsync(id);
                if (existingEntity == null)
                {
                    _logger.LogWarning("Deworming medication with id {Id} not found for deletion", id);
                    throw new KeyNotFoundException($"Deworming medication with ID {id} not found.");
                }

                // Update visit status when deleting
                var visit = await _visitRepository.GetByIdAsync(existingEntity.VisitId);
                if (visit != null)
                {
                    visit.IsDewormingMedicationCompleted = false;
                    await _visitRepository.UpdateAsync(visit);
                }

                var result = await _repository.DeleteAsync(id);
                _logger.LogInformation("Deworming medication {Id} deleted successfully", id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for deworming medication {Id}", id);
                throw;
            }
        }
    }
}