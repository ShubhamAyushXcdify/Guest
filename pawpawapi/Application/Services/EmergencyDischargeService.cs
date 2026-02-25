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
    public class EmergencyDischargeService : IEmergencyDischargeService
    {
        private readonly IEmergencyDischargeRepository _repository;
        private readonly IEmergencyPrescriptionRepository _prescriptionRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<EmergencyDischargeService> _logger;

        public EmergencyDischargeService(
            IEmergencyDischargeRepository repository,
            IEmergencyPrescriptionRepository prescriptionRepository,
            IVisitRepository visitRepository,
            IMapper mapper,
            ILogger<EmergencyDischargeService> logger)
        {
            _repository = repository;
            _prescriptionRepository = prescriptionRepository;
            _visitRepository = visitRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<EmergencyDischargeResponseDto?> GetByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                var discharge = await _repository.GetByIdAsync(id);
                if (discharge == null)
                {
                    _logger.LogWarning("Emergency discharge with id {Id} not found", id);
                    return null;
                }

                var prescriptions = await _prescriptionRepository.GetByDischargeIdAsync(id);
                var dto = _mapper.Map<EmergencyDischargeResponseDto>(discharge);
                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for emergency discharge {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<EmergencyDischargeResponseDto>> GetAllAsync()
        {
            try
            {
                var discharges = await _repository.GetAllAsync();
                var result = new List<EmergencyDischargeResponseDto>();
                foreach (var discharge in discharges)
                {
                    var prescriptions = await _prescriptionRepository.GetByDischargeIdAsync(discharge.Id);
                    var dto = _mapper.Map<EmergencyDischargeResponseDto>(discharge);
                    result.Add(dto);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync for emergency discharges");
                throw;
            }
        }

        public async Task<IEnumerable<EmergencyDischargeResponseDto>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    throw new ArgumentException("VisitId cannot be empty.", nameof(visitId));

                var discharges = await _repository.GetByVisitIdAsync(visitId);
                var result = new List<EmergencyDischargeResponseDto>();
                foreach (var discharge in discharges)
                {
                    var prescriptions = await _prescriptionRepository.GetByDischargeIdAsync(discharge.Id);
                    var dto = _mapper.Map<EmergencyDischargeResponseDto>(discharge);
                    result.Add(dto);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visitId {VisitId}", visitId);
                throw;
            }
        }

        public async Task<EmergencyDischargeWithPrescriptionsResponseDto?> GetWithPrescriptionsByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Id cannot be empty.", nameof(id));

                var discharge = await _repository.GetByIdAsync(id);
                if (discharge == null)
                {
                    _logger.LogWarning("Emergency discharge with id {Id} not found", id);
                    return null;
                }

                var prescriptions = await _prescriptionRepository.GetByDischargeIdAsync(id);
                var dto = new EmergencyDischargeWithPrescriptionsResponseDto
                {
                    Id = discharge.Id,
                    VisitId = discharge.VisitId,
                    DischargeStatus = discharge.DischargeStatus,
                    DischargeTime = discharge.DischargeTime,
                    ResponsibleClinician = discharge.ResponsibleClinician,
                    DischargeSummary = discharge.DischargeSummary,
                    HomeCareInstructions = discharge.HomeCareInstructions,
                    FollowupInstructions = discharge.FollowupInstructions,
                    FollowupDate = discharge.FollowupDate,
                    ReviewedWithClient = discharge.ReviewedWithClient,
                    IsCompleted = discharge.IsCompleted,
                    CreatedAt = discharge.CreatedAt,
                    UpdatedAt = discharge.UpdatedAt,
                };
                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetWithPrescriptionsByIdAsync for emergency discharge {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<EmergencyDischargeWithPrescriptionsResponseDto>> GetAllWithPrescriptionsByVisitIdAsync(Guid visitId)
        {
            var discharges = await _repository.GetByVisitIdAsync(visitId);
            var result = new List<EmergencyDischargeWithPrescriptionsResponseDto>();
            foreach (var discharge in discharges)
            {
                var prescriptions = await _prescriptionRepository.GetByDischargeIdAsync(discharge.Id);
                var dto = new EmergencyDischargeWithPrescriptionsResponseDto
                {
                    Id = discharge.Id,
                    VisitId = discharge.VisitId,
                    DischargeStatus = discharge.DischargeStatus,
                    DischargeTime = discharge.DischargeTime,
                    ResponsibleClinician = discharge.ResponsibleClinician,
                    DischargeSummary = discharge.DischargeSummary,
                    HomeCareInstructions = discharge.HomeCareInstructions,
                    FollowupInstructions = discharge.FollowupInstructions,
                    FollowupDate = discharge.FollowupDate,
                    ReviewedWithClient = discharge.ReviewedWithClient,
                    IsCompleted = discharge.IsCompleted,
                    CreatedAt = discharge.CreatedAt,
                    UpdatedAt = discharge.UpdatedAt,
                };
                result.Add(dto);
            }
            return result;
        }

        public async Task<EmergencyDischargeResponseDto> CreateAsync(CreateEmergencyDischargeRequestDto dto)
        {
            var discharge = _mapper.Map<EmergencyDischarge>(dto);
            discharge.Id = Guid.NewGuid();
            discharge.CreatedAt = DateTime.UtcNow;
            discharge.UpdatedAt = DateTime.UtcNow;

            // Explicitly map nullable bools to avoid random defaults
            discharge.ReviewedWithClient = dto.ReviewedWithClient ?? false;
            discharge.IsCompleted = dto.IsCompleted ?? false;

            await _repository.AddAsync(discharge);

            // Update Visit's IsEmergencyDischargeCompleted if VisitId is present
            if (dto.VisitId != Guid.Empty)
            {
                var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                if (visit != null)
                {
                    visit.IsEmergencyDischargeCompleted = discharge.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }
            }

            var response = _mapper.Map<EmergencyDischargeResponseDto>(discharge);
            return response;
        }

        public async Task<EmergencyDischargeWithPrescriptionsResponseDto> CreateWithPrescriptionsAsync(EmergencyDischargeWithPrescriptionsRequestDto dto)
        {
            // Manual mapping from DTO to model
            var discharge = new EmergencyDischarge
            {
                Id = Guid.NewGuid(),
                VisitId = dto.VisitId,
                DischargeStatus = dto.DischargeStatus,
                DischargeTime = dto.DischargeTime,
                ResponsibleClinician = dto.ResponsibleClinician,
                DischargeSummary = dto.DischargeSummary,
                HomeCareInstructions = dto.HomeCareInstructions,
                FollowupInstructions = dto.FollowupInstructions,
                FollowupDate = dto.FollowupDate,
                ReviewedWithClient = dto.ReviewedWithClient ?? false,
                IsCompleted = dto.IsCompleted ?? false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _repository.AddAsync(discharge);

            // Update Visit's IsEmergencyDischargeCompleted if VisitId is present
            if (dto.VisitId != Guid.Empty)
            {
                var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                if (visit != null)
                {
                    visit.IsEmergencyDischargeCompleted = dto.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }
            }
                
            // Manual mapping to response DTO
            var response = new EmergencyDischargeWithPrescriptionsResponseDto
            {
                Id = discharge.Id,
                VisitId = discharge.VisitId,
                DischargeStatus = discharge.DischargeStatus,
                DischargeTime = discharge.DischargeTime,
                ResponsibleClinician = discharge.ResponsibleClinician,
                DischargeSummary = discharge.DischargeSummary,
                HomeCareInstructions = discharge.HomeCareInstructions,
                FollowupInstructions = discharge.FollowupInstructions,
                ReviewedWithClient = discharge.ReviewedWithClient,
                IsCompleted = discharge.IsCompleted,
                CreatedAt = discharge.CreatedAt,
                UpdatedAt = discharge.UpdatedAt,
            };
            return response;
        }

        public async Task<EmergencyDischargeResponseDto> UpdateAsync(UpdateEmergencyDischargeRequestDto dto)
        {
            var discharge = await _repository.GetByIdAsync(dto.Id);
            if (discharge == null) throw new ArgumentException("Emergency discharge not found");
            _mapper.Map(dto, discharge);
            discharge.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(discharge);

            // Update Visit's IsEmergencyDischargeCompleted if VisitId is present
            if (dto.VisitId != Guid.Empty)
            {
                var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                if (visit != null)
                {
                    visit.IsEmergencyDischargeCompleted = dto.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }
            }
            var oldPrescriptions = await _prescriptionRepository.GetByDischargeIdAsync(dto.Id);
            foreach (var old in oldPrescriptions)
                await _prescriptionRepository.DeleteAsync(old.Id);
            var response = _mapper.Map<EmergencyDischargeResponseDto>(discharge);
            return response;
        }

        public async Task<EmergencyDischargeWithPrescriptionsResponseDto> UpdateWithPrescriptionsAsync(Guid id, EmergencyDischargeWithPrescriptionsRequestDto dto)
        {
            var discharge = await _repository.GetByIdAsync(id);
            if (discharge == null) throw new ArgumentException("Emergency discharge not found");
            // Manual update
            discharge.VisitId = dto.VisitId;
            discharge.DischargeStatus = dto.DischargeStatus;
            discharge.DischargeTime = dto.DischargeTime;
            discharge.ResponsibleClinician = dto.ResponsibleClinician;
            discharge.DischargeSummary = dto.DischargeSummary;
            discharge.HomeCareInstructions = dto.HomeCareInstructions;
            discharge.FollowupInstructions = dto.FollowupInstructions;
            discharge.FollowupDate = dto.FollowupDate;
            discharge.ReviewedWithClient = dto.ReviewedWithClient ?? false;
            discharge.IsCompleted = dto.IsCompleted ?? false;
            discharge.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(discharge);

            // Update Visit's IsEmergencyDischargeCompleted if VisitId is present
            if (dto.VisitId != Guid.Empty)
            {
                var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                if (visit != null)
                {
                    visit.IsEmergencyDischargeCompleted = dto.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }
            }
 
            // Manual mapping to response DTO
            var response = new EmergencyDischargeWithPrescriptionsResponseDto
            {
                Id = discharge.Id,
                VisitId = discharge.VisitId,
                DischargeStatus = discharge.DischargeStatus,
                DischargeTime = discharge.DischargeTime,
                ResponsibleClinician = discharge.ResponsibleClinician,
                DischargeSummary = discharge.DischargeSummary,
                HomeCareInstructions = discharge.HomeCareInstructions,
                FollowupInstructions = discharge.FollowupInstructions,
                ReviewedWithClient = discharge.ReviewedWithClient,
                IsCompleted = discharge.IsCompleted,
                CreatedAt = discharge.CreatedAt,
                UpdatedAt = discharge.UpdatedAt,
            };
            return response;
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
                    _logger.LogWarning("Emergency discharge with id {Id} not found for deletion", id);
                    throw new KeyNotFoundException($"Emergency discharge with ID {id} not found.");
                }

                // Update related visit status if needed
                if (existingEntity.VisitId != Guid.Empty)
                {
                    var visit = await _visitRepository.GetByIdAsync(existingEntity.VisitId);
                    if (visit != null)
                    {
                        visit.IsEmergencyDischargeCompleted = false;
                        await _visitRepository.UpdateAsync(visit);
                    }
                }

                await _repository.DeleteAsync(id);
                _logger.LogInformation("Emergency discharge {Id} deleted successfully", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for emergency discharge {Id}", id);
                throw;
            }
        }
    }
} 