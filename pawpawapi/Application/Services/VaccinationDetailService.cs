using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;

namespace Application.Services
{
    public class VaccinationDetailService : IVaccinationDetailService
    {
        private readonly IVaccinationDetailRepository _repository;
        private readonly IVaccinationMasterRepository _masterRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;

        public VaccinationDetailService(
            IVaccinationDetailRepository repository,
            IVaccinationMasterRepository masterRepository,
            IVisitRepository visitRepository,
            IMapper mapper)
        {
            _repository = repository;
            _masterRepository = masterRepository;
            _visitRepository = visitRepository;
            _mapper = mapper;
        }

        public async Task<VaccinationDetailResponseDto> CreateAsync(CreateVaccinationDetailRequestDto dto)
        {
            var entity = new VaccinationDetail
            {
                Id = Guid.NewGuid(),
                VisitId = dto.VisitId,
                Notes = dto.Notes,
                IsCompleted = dto.IsCompleted,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            // Get vaccination masters
            if (dto.VaccinationMasterIds?.Any() == true)
            {
                foreach (var masterId in dto.VaccinationMasterIds)
                {
                    var master = await _masterRepository.GetByIdAsync(masterId);
                    if (master != null)
                    {
                        entity.VaccinationMasters.Add(master);
                    }
                }
            }

            var created = await _repository.CreateAsync(entity);

            // Update visit's IsVaccinationCompleted status
            var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
            if (visit != null)
            {
                visit.IsVaccinationCompleted = dto.IsCompleted;
                await _visitRepository.UpdateAsync(visit);
            }

            return _mapper.Map<VaccinationDetailResponseDto>(created);
        }

        public async Task<VaccinationDetailResponseDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : _mapper.Map<VaccinationDetailResponseDto>(entity);
        }

        public async Task<IEnumerable<VaccinationDetailResponseDto>> GetByVisitIdAsync(Guid visitId)
        {
            var entities = await _repository.GetByVisitIdAsync(visitId);
            return _mapper.Map<IEnumerable<VaccinationDetailResponseDto>>(entities);
        }

        public async Task<VaccinationDetailResponseDto> UpdateAsync(UpdateVaccinationDetailRequestDto dto)
        {
            var existing = await _repository.GetByIdAsync(dto.Id);
            if (existing == null)
            {
                throw new KeyNotFoundException($"Vaccination detail with id {dto.Id} not found");
            }

            existing.Notes = dto.Notes;
            existing.IsCompleted = dto.IsCompleted;
            existing.UpdatedAt = DateTimeOffset.UtcNow;

            // Update VaccinationMasters
            existing.VaccinationMasters = new List<Core.Models.VaccinationMaster>();
            if (dto.VaccinationMasterIds?.Any() == true)
            {
                foreach (var masterId in dto.VaccinationMasterIds)
                {
                    var master = await _masterRepository.GetByIdAsync(masterId);
                    if (master != null)
                    {
                        existing.VaccinationMasters.Add(master);
                    }
                }
            }
            var updated = await _repository.UpdateAsync(existing);

            // Update visit's IsVaccinationCompleted status
            var visit = await _visitRepository.GetByIdAsync(updated.VisitId);
            if (visit != null)
            {
                var allDetails = await _repository.GetByVisitIdAsync(visit.Id);
                visit.IsVaccinationCompleted = allDetails.All(d => d.IsCompleted);
                await _visitRepository.UpdateAsync(visit);
            }

            return _mapper.Map<VaccinationDetailResponseDto>(updated);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                return false;
            }

            var visitId = existing.VisitId;
            var deleted = await _repository.DeleteAsync(id);

            if (deleted)
            {
                // Update visit's IsVaccinationCompleted status
                var visit = await _visitRepository.GetByIdAsync(visitId);
                if (visit != null)
                {
                    var remainingDetails = await _repository.GetByVisitIdAsync(visitId);
                    visit.IsVaccinationCompleted = !remainingDetails.Any() || remainingDetails.All(d => d.IsCompleted);
                    await _visitRepository.UpdateAsync(visit);
                }
            }

            return deleted;
        }

        public async Task<bool> UpdateVaccinationJsonAsync(Guid vaccinationDetailId, Guid vaccinationMasterId, string vaccinationJson)
        {
            try
            {
                return await _repository.UpdateVaccinationJsonAsync(vaccinationDetailId, vaccinationMasterId, vaccinationJson);
            }
            catch (Exception)
            {
                // Optionally log here if you have a logger, otherwise just return false
                // _logger.LogError("Error in UpdateVaccinationJsonAsync for detail {VaccinationDetailId} and master {VaccinationMasterId}", vaccinationDetailId, vaccinationMasterId);
                return false;
            }
        }

        public async Task<string?> GetVaccinationJsonAsync(Guid vaccinationDetailId, Guid vaccinationMasterId)
        {
            return await _repository.GetVaccinationJsonAsync(vaccinationDetailId, vaccinationMasterId);
        }
    }
} 