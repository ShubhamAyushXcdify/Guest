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
    public class ProcedureDetailService : IProcedureDetailService
    {
        private readonly IProcedureDetailRepository _procedureDetailRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ProcedureDetailService> _logger;

        public ProcedureDetailService(
            IProcedureDetailRepository procedureDetailRepository,
            IVisitRepository visitRepository,
            IMapper mapper,
            ILogger<ProcedureDetailService> logger)
        {
            _procedureDetailRepository = procedureDetailRepository ?? throw new ArgumentNullException(nameof(procedureDetailRepository));
            _visitRepository = visitRepository ?? throw new ArgumentNullException(nameof(visitRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ProcedureDetailResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var procedureDetail = await _procedureDetailRepository.GetByIdAsync(id);
                if (procedureDetail == null)
                {
                    throw new KeyNotFoundException($"Procedure detail with id {id} not found");
                }

                var responseDto = new ProcedureDetailResponseDto
                {
                    Id = procedureDetail.Id,
                    VisitId = procedureDetail.VisitId,
                    Notes = procedureDetail.Notes,
                    IsCompleted = procedureDetail.IsCompleted,
                    CreatedAt = procedureDetail.CreatedAt,
                    UpdatedAt = procedureDetail.UpdatedAt,
                    Procedures = procedureDetail.Procedures?.Select(p => new ProcedureDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Notes = p.Notes,
                        CreatedAt = p.CreatedAt??DateTime.Now,
                        UpdatedAt = p.UpdatedAt ?? DateTime.Now,
                    }).ToList()
                };

                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for procedure detail {ProcedureDetailId}", id);
                throw;
            }
        }

        public async Task<ProcedureDetailResponseDto> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                var procedureDetail = await _procedureDetailRepository.GetByVisitIdAsync(visitId);
                if (procedureDetail == null)
                {
                    throw new KeyNotFoundException($"Procedure detail for visit {visitId} not found");
                }

                var responseDto = new ProcedureDetailResponseDto
                {
                    Id = procedureDetail.Id,
                    VisitId = procedureDetail.VisitId,
                    Notes = procedureDetail.Notes,
                    IsCompleted = procedureDetail.IsCompleted,
                    CreatedAt = procedureDetail.CreatedAt,
                    UpdatedAt = procedureDetail.UpdatedAt,
                    Procedures = procedureDetail.Procedures?.Select(p => new ProcedureDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Notes = p.Notes,
                        CreatedAt = p.CreatedAt ?? DateTime.Now,
                        UpdatedAt = p.UpdatedAt ?? DateTime.Now,
                    }).ToList()
                };

                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitIdAsync for visit {VisitId}", visitId);
                throw;
            }
        }

        public async Task<ProcedureDetailResponseDto> CreateAsync(CreateProcedureDetailRequestDto dto)
        {
            try
            {
                var procedureDetail = _mapper.Map<ProcedureDetail>(dto);
                var createdProcedureDetail = await _procedureDetailRepository.CreateAsync(procedureDetail);

                // Update visit's IsProceduresCompleted status
                var visit = await _visitRepository.GetByIdAsync(dto.VisitId);
                if (visit != null)
                {
                    visit.IsProceduresCompleted = dto.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }

                if (dto.ProcedureIds != null && dto.ProcedureIds.Any())
                {
                    foreach (var procedureId in dto.ProcedureIds)
                    {
                        await _procedureDetailRepository.AddProcedureAsync(createdProcedureDetail.Id, procedureId);
                    }
                }
                var result = _mapper.Map<ProcedureDetailResponseDto>(createdProcedureDetail);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw;
            }
        }

        public async Task<ProcedureDetailResponseDto> UpdateAsync(UpdateProcedureDetailRequestDto dto)
        {
            try
            {
                var existingProcedureDetail = await _procedureDetailRepository.GetByIdAsync(dto.Id);
                if (existingProcedureDetail == null)
                {
                    throw new KeyNotFoundException($"Procedure detail with id {dto.Id} not found");
                }

                _mapper.Map(dto, existingProcedureDetail);
                var updatedProcedureDetail = await _procedureDetailRepository.UpdateAsync(existingProcedureDetail);

                // Update visit's IsProceduresCompleted status
                var visit = await _visitRepository.GetByIdAsync(updatedProcedureDetail.VisitId);
                if (visit != null)
                {
                    visit.IsProceduresCompleted = dto.IsCompleted;
                    await _visitRepository.UpdateAsync(visit);
                }

                if (dto.ProcedureIds != null)
                {
                    // Remove existing procedures
                    if (updatedProcedureDetail.Procedures != null)
                    {
                        foreach (var procedure in updatedProcedureDetail.Procedures)
                        {
                            await _procedureDetailRepository.RemoveProcedureAsync(updatedProcedureDetail.Id, procedure.Id);
                        }
                    }

                    // Add new procedures
                    foreach (var procedureId in dto.ProcedureIds)
                    {
                        await _procedureDetailRepository.AddProcedureAsync(updatedProcedureDetail.Id, procedureId);
                    }
                }

                return await GetByIdAsync(updatedProcedureDetail.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for procedure detail {ProcedureDetailId}", dto.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingProcedureDetail = await _procedureDetailRepository.GetByIdAsync(id);
                if (existingProcedureDetail == null)
                {
                    throw new KeyNotFoundException($"Procedure detail with id {id} not found");
                }

                return await _procedureDetailRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for procedure detail {ProcedureDetailId}", id);
                throw;
            }
        }
    }
} 