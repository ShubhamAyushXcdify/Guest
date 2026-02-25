using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public class PlanService : IPlanService
    {
        private readonly IPlanRepository _planRepository;
        private readonly ILogger<PlanService> _logger;

        public PlanService(IPlanRepository planRepository, ILogger<PlanService> logger)
        {
            _planRepository = planRepository ?? throw new ArgumentNullException(nameof(planRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PlanResponseDto> CreateAsync(CreatePlanRequestDto request)
        {
            try
            {
                var plan = new Plan
                {
                    Name = request.Name,
                    Notes = request.Notes
                };

                var createdPlan = await _planRepository.CreateAsync(plan);
                return MapToResponseDto(createdPlan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating plan");
                throw new InvalidOperationException("Failed to create plan", ex);
            }
        }

        public async Task<IEnumerable<PlanResponseDto>> GetAllAsync()
        {
            try
            {
                var plans = await _planRepository.GetAllAsync();
                return plans.Select(MapToResponseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all plans");
                throw new InvalidOperationException("Failed to get plans", ex);
            }
        }

        public async Task<PlanResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var plan = await _planRepository.GetByIdAsync(id);
                if (plan == null)
                {
                    throw new KeyNotFoundException($"Plan with id {id} not found");
                }
                return MapToResponseDto(plan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting plan {PlanId}", id);
                throw new InvalidOperationException($"Failed to get plan with id {id}", ex);
            }
        }

        public async Task<PlanResponseDto> UpdateAsync(UpdatePlanRequestDto request)
        {
            try
            {
                var existingPlan = await _planRepository.GetByIdAsync(request.Id);
                if (existingPlan == null)
                {
                    throw new KeyNotFoundException($"Plan with id {request.Id} not found");
                }

                existingPlan.Name = request.Name;
                existingPlan.Notes = request.Notes;

                var updatedPlan = await _planRepository.UpdateAsync(existingPlan);
                return MapToResponseDto(updatedPlan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating plan {PlanId}", request.Id);
                throw new InvalidOperationException($"Failed to update plan with id {request.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingPlan = await _planRepository.GetByIdAsync(id);
                if (existingPlan == null)
                {
                    throw new KeyNotFoundException($"Plan with id {id} not found");
                }

                return await _planRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting plan {PlanId}", id);
                throw new InvalidOperationException($"Failed to delete plan with id {id}", ex);
            }
        }

        private static PlanResponseDto MapToResponseDto(Plan plan)
        {
            return new PlanResponseDto
            {
                Id = plan.Id,
                Name = plan.Name,
                Notes = plan.Notes,
                CreatedAt = plan.CreatedAt,
                UpdatedAt = plan.UpdatedAt
            };
        }
    }
} 