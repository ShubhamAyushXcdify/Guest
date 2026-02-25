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
    public class ProcedureDocumentDetailsService : IProcedureDocumentDetailsService
    {
        private readonly IProcedureDocumentDetailsRepository _procedureDocumentDetailsRepository;
        private readonly IProcedureDetailRepository _procedureDetailRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ProcedureDocumentDetailsService> _logger;

        public ProcedureDocumentDetailsService(
            IProcedureDocumentDetailsRepository procedureDocumentDetailsRepository,
            IProcedureDetailRepository procedureDetailRepository,
            IMapper mapper,
            ILogger<ProcedureDocumentDetailsService> logger)
        {
            _procedureDocumentDetailsRepository = procedureDocumentDetailsRepository ?? throw new ArgumentNullException(nameof(procedureDocumentDetailsRepository));
            _procedureDetailRepository = procedureDetailRepository ?? throw new ArgumentNullException(nameof(procedureDetailRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ProcedureDocumentDetailsResponseDto> GetByVisitAndProcedureAsync(Guid visitId, Guid procedureId)
        {
            try
            {
                var mapping = await _procedureDocumentDetailsRepository.GetByVisitAndProcedureAsync(visitId, procedureId);
                if (mapping == null)
                {
                    throw new KeyNotFoundException($"Procedure document details not found for visit {visitId} and procedure {procedureId}");
                }

                var responseDto = _mapper.Map<ProcedureDocumentDetailsResponseDto>(mapping);
                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitAndProcedureAsync for visit {VisitId} and procedure {ProcedureId}", visitId, procedureId);
                throw;
            }
        }

        public async Task<ProcedureDocumentDetailsResponseDto> CreateAsync(CreateProcedureDocumentDetailsRequestDto dto)
        {
            try
            {
                // Get or create procedure detail for the visit
                var procedureDetail = await _procedureDetailRepository.GetByVisitIdAsync(dto.VisitId);
                if (procedureDetail == null)
                {
                    // Create a new procedure detail for the visit
                    procedureDetail = new ProcedureDetail
                    {
                        VisitId = dto.VisitId,
                        Notes = "Auto-created for document details",
                        IsCompleted = false
                    };
                    procedureDetail = await _procedureDetailRepository.CreateAsync(procedureDetail);
                }

                var mapping = new ProcedureDetailMapping
                {
                    ProcedureDetailId = procedureDetail.Id,
                    ProcedureId = dto.ProcedureId,
                    DocumentDetails = dto.DocumentDetails
                };

                var createdMapping = await _procedureDocumentDetailsRepository.CreateAsync(mapping);
                var responseDto = _mapper.Map<ProcedureDocumentDetailsResponseDto>(createdMapping);
                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw;
            }
        }

        public async Task<ProcedureDocumentDetailsResponseDto> UpdateAsync(UpdateProcedureDocumentDetailsRequestDto dto)
        {
            try
            {
                var existingMapping = await _procedureDocumentDetailsRepository.GetByIdAsync(dto.Id);
                if (existingMapping == null)
                {
                    throw new KeyNotFoundException($"Procedure document details with id {dto.Id} not found");
                }

                existingMapping.DocumentDetails = dto.DocumentDetails;
                var updatedMapping = await _procedureDocumentDetailsRepository.UpdateAsync(existingMapping);
                var responseDto = _mapper.Map<ProcedureDocumentDetailsResponseDto>(updatedMapping);
                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for mapping {MappingId}", dto.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var result = await _procedureDocumentDetailsRepository.DeleteAsync(id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for mapping {MappingId}", id);
                throw;
            }
        }
    }
} 