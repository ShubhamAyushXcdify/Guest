using System;
using System.Threading.Tasks;
using System.Linq;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace Application.Services
{
    public class PlanDetailService : IPlanDetailService
    {
        private readonly IPlanDetailRepository _planDetailRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<PlanDetailService> _logger;

        public PlanDetailService(
            IPlanDetailRepository planDetailRepository,
            IVisitRepository visitRepository,
            IMapper mapper,
            ILogger<PlanDetailService> logger)
        {
            _planDetailRepository = planDetailRepository ?? throw new ArgumentNullException(nameof(planDetailRepository));
            _visitRepository = visitRepository ?? throw new ArgumentNullException(nameof(visitRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PlanDetailResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var planDetail = await _planDetailRepository.GetByIdAsync(id);
                if (planDetail == null)
                {
                    throw new KeyNotFoundException($"Plan detail with id {id} not found");
                }

                return _mapper.Map<PlanDetailResponseDto>(planDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for plan detail {PlanDetailId}", id);
                throw;
            }
        }

        public async Task<PlanDetailResponseDto> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                var planDetail = await _planDetailRepository.GetByVisitIdAsync(visitId);
                if (planDetail == null)
                {
                    throw new KeyNotFoundException($"Plan detail for visit {visitId} not found");
                }

                return _mapper.Map<PlanDetailResponseDto>(planDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<PlanDetailResponseDto> CreateAsync(CreatePlanDetailRequestDto request)
        {
            try
            {
                var planDetail = _mapper.Map<Core.Models.PlanDetail>(request);
                var createdPlanDetail = await _planDetailRepository.CreateAsync(planDetail);

                // Update visit's IsPlansCompleted status
                var visit = await _visitRepository.GetByIdAsync(request.VisitId);
                if (visit != null)
                {
                    visit.IsPlanCompleted = request.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }

                if (request.PlanIds != null && request.PlanIds.Any())
                {
                    foreach (var planId in request.PlanIds)
                    {
                        await _planDetailRepository.AddPlanAsync(createdPlanDetail.Id, planId);
                    }
                }

                return await GetByIdAsync(createdPlanDetail.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw;
            }
        }

        public async Task<PlanDetailResponseDto> UpdateAsync(UpdatePlanDetailRequestDto dto)
        {
            try
            {
                var existingPlanDetail = await _planDetailRepository.GetByIdAsync(dto.Id);
                if (existingPlanDetail == null)
                {
                    throw new KeyNotFoundException($"Plan detail with id {dto.Id} not found");
                }

                _mapper.Map(dto, existingPlanDetail);
                var updatedPlanDetail = await _planDetailRepository.UpdateAsync(existingPlanDetail);

                // Update visit's IsPlansCompleted status
                var visit = await _visitRepository.GetByIdAsync(updatedPlanDetail.VisitId);
                if (visit != null)
                {
                    visit.IsPlanCompleted = dto.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }

                if (dto.PlanIds != null)
                {
                    // Remove existing plans
                    if (updatedPlanDetail.Plans != null)
                    {
                        foreach (var plan in updatedPlanDetail.Plans)
                        {
                            await _planDetailRepository.RemovePlanAsync(updatedPlanDetail.Id, plan.Id);
                        }
                    }

                    // Add new plans
                    foreach (var planId in dto.PlanIds)
                    {
                        await _planDetailRepository.AddPlanAsync(updatedPlanDetail.Id, planId);
                    }
                }

                return await GetByIdAsync(updatedPlanDetail.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for plan detail {PlanDetailId}", dto.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingPlanDetail = await _planDetailRepository.GetByIdAsync(id);
                if (existingPlanDetail == null)
                {
                    throw new KeyNotFoundException($"Plan detail with id {id} not found");
                }

                return await _planDetailRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for plan detail {PlanDetailId}", id);
                throw;
            }
        }
    }
} 