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
    /// <summary>
    /// Service for managing emergency triage operations with optimized performance and clean architecture
    /// </summary>
    public class EmergencyVisitService : IEmergencyVisitService
    {
        private readonly IEmergencyVisitRepository _emergencyVisitRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<EmergencyVisitService> _logger;

        public EmergencyVisitService(
            IEmergencyVisitRepository emergencyVisitRepository,
            IVisitRepository visitRepository,
            IMapper mapper,
            ILogger<EmergencyVisitService> logger)
        {
            _emergencyVisitRepository = emergencyVisitRepository ?? throw new ArgumentNullException(nameof(emergencyVisitRepository));
            _visitRepository = visitRepository ?? throw new ArgumentNullException(nameof(visitRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves a specific emergency triage record by ID
        /// </summary>
        /// <param name="id">The emergency triage ID</param>
        /// <returns>Emergency triage response DTO or null if not found</returns>
        public async Task<EmergencyTriageResponseDto?> GetByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Emergency triage ID cannot be empty", nameof(id));

                _logger.LogDebug("Retrieving emergency triage with ID {Id}", id);

                var entity = await _emergencyVisitRepository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Emergency triage with ID {Id} not found", id);
                    return null;
                }

                var result = _mapper.Map<EmergencyTriageResponseDto>(entity);
                _logger.LogDebug("Successfully retrieved emergency triage {Id}", id);

                return result;
            }
            catch (ArgumentException)
            {
                throw; // Re-throw argument exceptions as they are client errors
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve emergency triage {Id}", id);
                throw new InvalidOperationException($"An error occurred while retrieving emergency triage {id}", ex);
            }
        }

        /// <summary>
        /// Retrieves all emergency triage records with optimized mapping
        /// </summary>
        /// <returns>Collection of emergency triage response DTOs</returns>
        public async Task<IEnumerable<EmergencyTriageResponseDto>> GetAllAsync()
        {
            try
            {
                _logger.LogDebug("Retrieving all emergency triage records");

                var entities = await _emergencyVisitRepository.GetAllAsync();
                var result = _mapper.Map<IEnumerable<EmergencyTriageResponseDto>>(entities);

                _logger.LogDebug("Successfully retrieved {Count} emergency triage records", result.Count());
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve emergency triage records");
                throw new InvalidOperationException("An error occurred while retrieving emergency triage records", ex);
            }
        }

        /// <summary>
        /// Creates a new emergency triage record with comprehensive validation and optimized performance
        /// </summary>
        /// <param name="dto">Emergency triage creation data</param>
        /// <returns>Created emergency triage response DTO</returns>
        public async Task<EmergencyTriageResponseDto> CreateAsync(CreateEmergencyTriageRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto), "Emergency triage data cannot be null");

                _logger.LogDebug("Creating emergency triage for visit {VisitId}", dto.VisitId);

                // Comprehensive business logic validation
                await ValidateEmergencyTriageBusinessRulesAsync(dto);

                // Validate visit exists and get visit info in one call
                await ValidateVisitExistsAsync(dto.VisitId);

                // Create entity with optimized mapping
                var entity = _mapper.Map<EmergencyTriage>(dto);
                entity.Id = Guid.NewGuid();
                entity.CreatedAt = DateTime.UtcNow;
                entity.UpdatedAt = DateTime.UtcNow;

                // Add to repository
                await _emergencyVisitRepository.AddAsync(entity);

                // Update visit status if needed
                if (dto.VisitId != Guid.Empty && dto.IsComplete.HasValue)
                {
                    var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                    if (visit != null)
                    {
                        visit.IsEmergencyTriageCompleted = dto.IsComplete.Value;
                        await _visitRepository.UpdateAsync(visit);
                    }
                }

                var result = _mapper.Map<EmergencyTriageResponseDto>(entity);

                _logger.LogInformation("Emergency triage created successfully with ID {Id} for visit {VisitId}",
                    entity.Id, dto.VisitId);

                return result;
            }
            catch (ArgumentNullException)
            {
                throw; // Re-throw argument null exceptions as they are client errors
            }
            catch (InvalidOperationException)
            {
                throw; // Re-throw business logic exceptions as they are client errors
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create emergency triage for visit {VisitId}", dto?.VisitId);
                throw new InvalidOperationException("An error occurred while creating the emergency triage record", ex);
            }
        }

        /// <summary>
        /// Updates an existing emergency triage record with comprehensive validation and optimized performance
        /// </summary>
        /// <param name="dto">Emergency triage update data</param>
        /// <returns>Updated emergency triage response DTO</returns>
        public async Task<EmergencyTriageResponseDto> UpdateAsync(UpdateEmergencyTriageRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto), "Emergency triage data cannot be null");

                if (dto.Id == Guid.Empty)
                    throw new ArgumentException("Emergency triage ID cannot be empty", nameof(dto.Id));

                _logger.LogDebug("Updating emergency triage {Id} for visit {VisitId}", dto.Id, dto.VisitId);

                // Check if entity exists
                var entity = await _emergencyVisitRepository.GetByIdAsync(dto.Id);
                if (entity == null)
                    throw new KeyNotFoundException($"Emergency triage with ID {dto.Id} not found");

                // Comprehensive business logic validation
                await ValidateEmergencyTriageBusinessRulesAsync(dto);

                // Validate visit exists
                await ValidateVisitExistsAsync(dto.VisitId);

                // Update entity with optimized mapping
                _mapper.Map(dto, entity);
                entity.UpdatedAt = DateTime.UtcNow;

                await _emergencyVisitRepository.UpdateAsync(entity);

                // Update visit status if needed
                if (dto.VisitId != Guid.Empty && dto.IsComplete.HasValue)
                {
                    var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                    if (visit != null)
                    {
                        visit.IsEmergencyTriageCompleted = dto.IsComplete.Value;
                        await _visitRepository.UpdateAsync(visit);
                    }
                }

                var result = _mapper.Map<EmergencyTriageResponseDto>(entity);

                _logger.LogInformation("Emergency triage {Id} updated successfully for visit {VisitId}",
                    dto.Id, dto.VisitId);

                return result;
            }
            catch (ArgumentNullException)
            {
                throw; // Re-throw argument null exceptions as they are client errors
            }
            catch (ArgumentException)
            {
                throw; // Re-throw argument exceptions as they are client errors
            }
            catch (KeyNotFoundException)
            {
                throw; // Re-throw not found exceptions as they are client errors
            }
            catch (InvalidOperationException)
            {
                throw; // Re-throw business logic exceptions as they are client errors
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update emergency triage {Id}", dto?.Id);
                throw new InvalidOperationException("An error occurred while updating the emergency triage record", ex);
            }
        }

        /// <summary>
        /// Deletes an emergency triage record with proper cleanup and validation
        /// </summary>
        /// <param name="id">Emergency triage ID to delete</param>
        public async Task DeleteAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Emergency triage ID cannot be empty", nameof(id));

                _logger.LogDebug("Deleting emergency triage {Id}", id);

                // Check if entity exists
                var existingEntity = await _emergencyVisitRepository.GetByIdAsync(id);
                if (existingEntity == null)
                {
                    _logger.LogWarning("Emergency triage {Id} not found for deletion", id);
                    throw new KeyNotFoundException($"Emergency triage with ID {id} not found");
                }

                // Update related visit status if needed
                if (existingEntity.VisitId.HasValue)
                {
                    var visit = await _visitRepository.GetByIdAsync(existingEntity.VisitId.Value);
                    if (visit != null)
                    {
                        visit.IsEmergencyTriageCompleted = false;
                        await _visitRepository.UpdateAsync(visit);
                    }
                }

                await _emergencyVisitRepository.DeleteAsync(id);

                _logger.LogInformation("Emergency triage {Id} deleted successfully", id);
            }
            catch (ArgumentException)
            {
                throw; // Re-throw argument exceptions as they are client errors
            }
            catch (KeyNotFoundException)
            {
                throw; // Re-throw not found exceptions as they are client errors
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete emergency triage {Id}", id);
                throw new InvalidOperationException("An error occurred while deleting the emergency triage record", ex);
            }
        }

        /// <summary>
        /// Retrieves emergency triage records by visit ID with optimized performance
        /// </summary>
        /// <param name="visitId">Visit ID to search for</param>
        /// <returns>Collection of emergency triage response DTOs for the visit</returns>
        public async Task<IEnumerable<EmergencyTriageResponseDto>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    throw new ArgumentException("Visit ID cannot be empty", nameof(visitId));

                _logger.LogDebug("Retrieving emergency triage records for visit {VisitId}", visitId);

                var entities = await _emergencyVisitRepository.GetByVisitIdAsync(visitId);
                var result = _mapper.Map<IEnumerable<EmergencyTriageResponseDto>>(entities);

                _logger.LogDebug("Successfully retrieved {Count} emergency triage records for visit {VisitId}",
                    result.Count(), visitId);

                return result;
            }
            catch (ArgumentException)
            {
                throw; // Re-throw argument exceptions as they are client errors
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve emergency triage records for visit {VisitId}", visitId);
                throw new InvalidOperationException("An error occurred while retrieving emergency triage records", ex);
            }
        }

        #region Private Validation Methods

        /// <summary>
        /// Validates emergency triage business rules for create operations
        /// </summary>
        /// <param name="dto">Create emergency triage request DTO</param>
        private async Task ValidateEmergencyTriageBusinessRulesAsync(CreateEmergencyTriageRequestDto dto)
        {
            // Validate arrival time is not in the future (allow 5 minutes tolerance for clock differences)
            if (dto.ArrivalTime > DateTime.UtcNow.AddMinutes(5))
                throw new InvalidOperationException("Arrival time cannot be in the future");

            // Validate arrival time is not too far in the past (more than 30 days)
            if (dto.ArrivalTime < DateTime.UtcNow.AddDays(-30))
                throw new InvalidOperationException("Arrival time cannot be more than 30 days in the past");

            // Validate pain score range
            if (dto.PainScore.HasValue && (dto.PainScore < 0 || dto.PainScore > 10))
                throw new InvalidOperationException("Pain score must be between 0 and 10");

            // Validate triage category and level consistency
            ValidateTriageCategoryLevelConsistency(dto.TriageCategory, dto.TriageLevel);

            // Validate immediate intervention flag consistency
            if (dto.ImmediateInterventionRequired == true &&
                !string.IsNullOrEmpty(dto.TriageCategory) &&
                !dto.TriageCategory.Equals("critical", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Immediate intervention required should only be true for critical cases");
            }

            await Task.CompletedTask; // For async consistency
        }

        /// <summary>
        /// Validates emergency triage business rules for update operations
        /// </summary>
        /// <param name="dto">Update emergency triage request DTO</param>
        private async Task ValidateEmergencyTriageBusinessRulesAsync(UpdateEmergencyTriageRequestDto dto)
        {
            // Validate arrival time is not in the future (allow 5 minutes tolerance for clock differences)
            if (dto.ArrivalTime > DateTime.UtcNow.AddMinutes(5))
                throw new InvalidOperationException("Arrival time cannot be in the future");

            // Validate arrival time is not too far in the past (more than 30 days)
            if (dto.ArrivalTime < DateTime.UtcNow.AddDays(-30))
                throw new InvalidOperationException("Arrival time cannot be more than 30 days in the past");

            // Validate pain score range
            if (dto.PainScore.HasValue && (dto.PainScore < 0 || dto.PainScore > 10))
                throw new InvalidOperationException("Pain score must be between 0 and 10");

            // Validate triage category and level consistency
            ValidateTriageCategoryLevelConsistency(dto.TriageCategory, dto.TriageLevel);

            // Validate immediate intervention flag consistency
            if (dto.ImmediateInterventionRequired == true &&
                !string.IsNullOrEmpty(dto.TriageCategory) &&
                !dto.TriageCategory.Equals("critical", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Immediate intervention required should only be true for critical cases");
            }

            await Task.CompletedTask; // For async consistency
        }

        /// <summary>
        /// Validates that the visit exists
        /// </summary>
        /// <param name="visitId">Visit ID to validate</param>
        private async Task ValidateVisitExistsAsync(Guid visitId)
        {
            if (visitId != Guid.Empty)
            {
                var visit = await _visitRepository.GetByIdAsync(visitId);
                if (visit == null)
                    throw new InvalidOperationException($"Visit with ID {visitId} not found");
            }
        }

        /// <summary>
        /// Validates triage category and level consistency
        /// </summary>
        /// <param name="triageCategory">Triage category</param>
        /// <param name="triageLevel">Triage level</param>
        private static void ValidateTriageCategoryLevelConsistency(string? triageCategory, string? triageLevel)
        {
            if (!string.IsNullOrEmpty(triageCategory) && !string.IsNullOrEmpty(triageLevel))
            {
                var isValidCombination = triageCategory.ToLowerInvariant() switch
                {
                    "critical" => triageLevel == "Level 1",
                    "high" => triageLevel == "Level 2",
                    "medium" => triageLevel == "Level 3",
                    "low" => triageLevel == "Level 4" || triageLevel == "Level 5",
                    _ => true // Allow other combinations for flexibility
                };

                if (!isValidCombination)
                    throw new InvalidOperationException($"Triage category '{triageCategory}' is not consistent with triage level '{triageLevel}'");
            }
        }

        #endregion
    }
}