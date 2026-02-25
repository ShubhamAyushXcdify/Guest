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
    public class ComplaintDetailService : IComplaintDetailService
    {
        private readonly IComplaintDetailRepository _complaintDetailRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ComplaintDetailService> _logger;

        public ComplaintDetailService(
            IComplaintDetailRepository complaintDetailRepository,
            IVisitRepository visitRepository,
            IMapper mapper,
            ILogger<ComplaintDetailService> logger)
        {
            _complaintDetailRepository = complaintDetailRepository ?? throw new ArgumentNullException(nameof(complaintDetailRepository));
            _visitRepository = visitRepository ?? throw new ArgumentNullException(nameof(visitRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ComplaintDetailResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var complaintDetail = await _complaintDetailRepository.GetByIdAsync(id);
                if (complaintDetail == null)
                {
                    throw new KeyNotFoundException($"Complaint detail with id {id} not found");
                }

                return _mapper.Map<ComplaintDetailResponseDto>(complaintDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for complaint detail {ComplaintDetailId}", id);
                throw;
            }
        }

        public async Task<ComplaintDetailResponseDto> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                var complaintDetail = await _complaintDetailRepository.GetByVisitIdAsync(visitId);
                if (complaintDetail == null)
                {
                    throw new KeyNotFoundException($"Complaint detail for visit {visitId} not found");
                }

                return _mapper.Map<ComplaintDetailResponseDto>(complaintDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<ComplaintDetailResponseDto> CreateAsync(CreateComplaintDetailRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Complaint detail data cannot be null.");

                // Validate visit exists
                var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                if (visit == null)
                    throw new InvalidOperationException($"Visit with ID {dto.VisitId} not found.");

                // Check if complaint detail already exists for this visit
                var existingComplaintDetail = await _complaintDetailRepository.GetByVisitIdAsync(dto.VisitId);
                if (existingComplaintDetail != null)
                    throw new InvalidOperationException($"Complaint detail already exists for visit {dto.VisitId}.");

                var complaintDetail = _mapper.Map<ComplaintDetail>(dto);
                var createdComplaintDetail = await _complaintDetailRepository.CreateAsync(complaintDetail);

                // Update visit's IsComplaintsCompleted status
                visit.IsComplaintsCompleted = dto.IsCompleted;
                await _visitRepository.UpdateAsync(visit);

                // Add symptoms if provided
                if (dto.SymptomIds != null && dto.SymptomIds.Any())
                {
                    foreach (var symptomId in dto.SymptomIds)
                    {
                        await _complaintDetailRepository.AddSymptomAsync(createdComplaintDetail.Id, symptomId);
                    }
                }

                return await GetByIdAsync(createdComplaintDetail.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync for visit {VisitId}", dto?.VisitId);
                throw;
            }
        }

        public async Task<ComplaintDetailResponseDto> UpdateAsync(UpdateComplaintDetailRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new InvalidOperationException("Complaint detail data cannot be null.");

                var existingComplaintDetail = await _complaintDetailRepository.GetByIdAsync(dto.Id);
                if (existingComplaintDetail == null)
                {
                    throw new KeyNotFoundException($"Complaint detail with id {dto.Id} not found.");
                }

                // Validate visit exists
                var visit = await _visitRepository.GetByIdAsync(existingComplaintDetail.VisitId);
                if (visit == null)
                    throw new InvalidOperationException($"Visit with ID {existingComplaintDetail.VisitId} not found.");

                _mapper.Map(dto, existingComplaintDetail);
                var updatedComplaintDetail = await _complaintDetailRepository.UpdateAsync(existingComplaintDetail);

                // Update visit's IsComplaintsCompleted status
                visit.IsComplaintsCompleted = dto.IsCompleted;
                await _visitRepository.UpdateAsync(visit);

                // Update symptoms if provided
                if (dto.SymptomIds != null)
                {
                    // Remove existing symptoms
                    if (updatedComplaintDetail.Symptoms != null)
                    {
                        foreach (var symptom in updatedComplaintDetail.Symptoms)
                        {
                            await _complaintDetailRepository.RemoveSymptomAsync(updatedComplaintDetail.Id, symptom.Id);
                        }
                    }

                    // Add new symptoms
                    foreach (var symptomId in dto.SymptomIds)
                    {
                        await _complaintDetailRepository.AddSymptomAsync(updatedComplaintDetail.Id, symptomId);
                    }
                }

                return await GetByIdAsync(updatedComplaintDetail.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for complaint detail {ComplaintDetailId}", dto?.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingComplaintDetail = await _complaintDetailRepository.GetByIdAsync(id);
                if (existingComplaintDetail == null)
                {
                    return false; // Return false instead of throwing exception for consistency
                }

                // Update visit's IsComplaintsCompleted status to false when deleting
                var visit = await _visitRepository.GetByIdAsync(existingComplaintDetail.VisitId);
                if (visit != null)
                {
                    visit.IsComplaintsCompleted = false;
                    await _visitRepository.UpdateAsync(visit);
                }

                return await _complaintDetailRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for complaint detail {ComplaintDetailId}", id);
                throw;
            }
        }
    }
} 