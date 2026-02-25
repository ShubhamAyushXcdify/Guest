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
    public class VitalDetailService : IVitalDetailService
    {
        private readonly IVitalDetailRepository _vitalDetailRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<VitalDetailService> _logger;

        public VitalDetailService(
            IVitalDetailRepository vitalDetailRepository,
            IVisitRepository visitRepository,
            IMapper mapper,
            ILogger<VitalDetailService> logger)
        {
            _vitalDetailRepository = vitalDetailRepository ?? throw new ArgumentNullException(nameof(vitalDetailRepository));
            _visitRepository = visitRepository ?? throw new ArgumentNullException(nameof(visitRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<VitalDetailResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var vitalDetail = await _vitalDetailRepository.GetByIdAsync(id);
                if (vitalDetail == null)
                {
                    throw new KeyNotFoundException($"Vital detail with id {id} not found");
                }

                return _mapper.Map<VitalDetailResponseDto>(vitalDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for vital detail {VitalDetailId}", id);
                throw;
            }
        }

        public async Task<VitalDetailResponseDto> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                var vitalDetail = await _vitalDetailRepository.GetByVisitIdAsync(visitId);
                if (vitalDetail == null)
                {
                    throw new KeyNotFoundException($"Vital detail for visit {visitId} not found");
                }

                return _mapper.Map<VitalDetailResponseDto>(vitalDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<VitalDetailResponseDto> CreateAsync(CreateVitalDetailRequestDto dto)
        {
            try
            {
                var vitalDetail = _mapper.Map<VitalDetail>(dto);
                var createdVitalDetail = await _vitalDetailRepository.CreateAsync(vitalDetail);

                // Update visit's IsVitalsCompleted status
                var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                if (visit != null)
                {
                    visit.IsVitalsCompleted = dto.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }

                return _mapper.Map<VitalDetailResponseDto>(createdVitalDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw;
            }
        }

        public async Task<VitalDetailResponseDto> UpdateAsync(UpdateVitalDetailRequestDto dto)
        {
            try
            {
                var existingVitalDetail = await _vitalDetailRepository.GetByIdAsync(dto.Id);
                if (existingVitalDetail == null)
                {
                    throw new KeyNotFoundException($"Vital detail with id {dto.Id} not found");
                }

                _mapper.Map(dto, existingVitalDetail);
                var updatedVitalDetail = await _vitalDetailRepository.UpdateAsync(existingVitalDetail);

                // Update visit's IsVitalsCompleted status
                var visit = await _visitRepository.GetByIdAsync(updatedVitalDetail.VisitId);
                if (visit != null)
                {
                    visit.IsVitalsCompleted = dto.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }

                return _mapper.Map<VitalDetailResponseDto>(updatedVitalDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for vital detail {VitalDetailId}", dto.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingVitalDetail = await _vitalDetailRepository.GetByIdAsync(id);
                if (existingVitalDetail == null)
                {
                    throw new KeyNotFoundException($"Vital detail with id {id} not found");
                }

                return await _vitalDetailRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for vital detail {VitalDetailId}", id);
                throw;
            }
        }
    }
} 