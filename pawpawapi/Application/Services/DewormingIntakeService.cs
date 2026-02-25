using System;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class DewormingIntakeService : IDewormingIntakeService
    {
        private readonly IDewormingIntakeRepository _repository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<DewormingIntakeService> _logger;

        public DewormingIntakeService(IDewormingIntakeRepository repository, IVisitRepository visitRepository, IMapper mapper, ILogger<DewormingIntakeService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _visitRepository = visitRepository ?? throw new ArgumentNullException(nameof(visitRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<DewormingIntakeResponseDto> CreateAsync(CreateDewormingIntakeRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Deworming intake data cannot be null.");

                // Validate visit exists
                var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                if (visit == null)
                    throw new InvalidOperationException($"Visit with ID {dto.VisitId} not found.");

                // Check if data already exists for this visitId
                var existingData = await _repository.GetByVisitIdAsync(dto.VisitId);
                if (existingData != null)
                {
                    throw new InvalidOperationException($"Deworming intake data for visit ID {dto.VisitId} already exists. Cannot create duplicate records.");
                }

                var entity = _mapper.Map<DewormingIntake>(dto);
                var created = await _repository.CreateAsync(entity);

                // Update Visit's is_deworming_intake_completed
                visit.IsDewormingIntakeCompleted = created.IsCompleted;
                await _visitRepository.UpdateAsync(visit);

                return _mapper.Map<DewormingIntakeResponseDto>(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync for deworming intake with visit {VisitId}", dto?.VisitId);
                throw;
            }
        }

        public async Task<DewormingIntakeResponseDto?> GetByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Deworming intake with id {Id} not found", id);
                    return null;
                }

                return _mapper.Map<DewormingIntakeResponseDto>(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for deworming intake {Id}", id);
                throw;
            }
        }

        public async Task<DewormingIntakeResponseDto?> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    throw new ArgumentException("Visit ID cannot be empty.", nameof(visitId));

                var entity = await _repository.GetByVisitIdAsync(visitId);
                if (entity == null)
                {
                    _logger.LogWarning("Deworming intake for visit {VisitId} not found", visitId);
                    return null;
                }

                return _mapper.Map<DewormingIntakeResponseDto>(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for deworming intake with visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<DewormingIntakeResponseDto> UpdateAsync(UpdateDewormingIntakeRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Deworming intake data cannot be null.");

                if (dto.Id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(dto.Id));

                // Check if entity exists
                var existingEntity = await _repository.GetByIdAsync(dto.Id);
                if (existingEntity == null)
                    throw new KeyNotFoundException($"Deworming intake with ID {dto.Id} not found.");

                var entity = _mapper.Map<DewormingIntake>(dto);
                var updated = await _repository.UpdateAsync(entity);

                // Update Visit's is_deworming_intake_completed
                var visit = await _visitRepository.GetByIdAsync(updated.VisitId);
                if (visit != null)
                {
                    visit.IsDewormingIntakeCompleted = updated.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }

                return _mapper.Map<DewormingIntakeResponseDto>(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for deworming intake {Id}", dto?.Id);
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
                    _logger.LogWarning("Deworming intake with id {Id} not found for deletion", id);
                    throw new KeyNotFoundException($"Deworming intake with ID {id} not found.");
                }

                // Update visit status when deleting
                var visit = await _visitRepository.GetByIdAsync(existingEntity.VisitId);
                if (visit != null)
                {
                    visit.IsDewormingIntakeCompleted = false;
                    await _visitRepository.UpdateAsync(visit);
                }

                var result = await _repository.DeleteAsync(id);
                _logger.LogInformation("Deworming intake {Id} deleted successfully", id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for deworming intake {Id}", id);
                throw;
            }
        }
    }
} 