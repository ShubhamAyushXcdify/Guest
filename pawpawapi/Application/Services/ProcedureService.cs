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
    public class ProcedureService : IProcedureService
    {
        private readonly IProcedureRepository _procedureRepository;
        private readonly ILogger<ProcedureService> _logger;

        public ProcedureService(IProcedureRepository procedureRepository, ILogger<ProcedureService> logger)
        {
            _procedureRepository = procedureRepository ?? throw new ArgumentNullException(nameof(procedureRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ProcedureResponseDto> CreateAsync(CreateProcedureRequestDto request)
        {
            try
            {
                var procedure = new Procedure
                {
                    Name = request.Name,
                    Notes = request.Notes
                };

                var createdProcedure = await _procedureRepository.CreateAsync(procedure);
                return MapToResponseDto(createdProcedure);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating procedure");
                throw new InvalidOperationException("Failed to create procedure", ex);
            }
        }

        public async Task<IEnumerable<ProcedureResponseDto>> GetAllAsync(string? type = null)
        {
            try
            {
                var procedures = await _procedureRepository.GetAllAsync(type);
                return procedures.Select(MapToResponseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all procedures");
                throw new InvalidOperationException("Failed to get procedures", ex);
            }
        }

        public async Task<ProcedureResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var procedure = await _procedureRepository.GetByIdAsync(id);
                if (procedure == null)
                {
                    throw new KeyNotFoundException($"Procedure with id {id} not found");
                }
                return MapToResponseDto(procedure);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting procedure {ProcedureId}", id);
                throw new InvalidOperationException($"Failed to get procedure with id {id}", ex);
            }
        }

        public async Task<ProcedureResponseDto> UpdateAsync(UpdateProcedureRequestDto request)
        {
            try
            {
                var existingProcedure = await _procedureRepository.GetByIdAsync(request.Id);
                if (existingProcedure == null)
                {
                    throw new KeyNotFoundException($"Procedure with id {request.Id} not found");
                }

                existingProcedure.Name = request.Name;
                existingProcedure.Notes = request.Notes;

                var updatedProcedure = await _procedureRepository.UpdateAsync(existingProcedure);
                return MapToResponseDto(updatedProcedure);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating procedure {ProcedureId}", request.Id);
                throw new InvalidOperationException($"Failed to update procedure with id {request.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingProcedure = await _procedureRepository.GetByIdAsync(id);
                if (existingProcedure == null)
                {
                    throw new KeyNotFoundException($"Procedure with id {id} not found");
                }

                return await _procedureRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting procedure {ProcedureId}", id);
                throw new InvalidOperationException($"Failed to delete procedure with id {id}", ex);
            }
        }

        private static ProcedureResponseDto MapToResponseDto(Procedure procedure)
        {
            return new ProcedureResponseDto
            {
                Id = procedure.Id,
                Name = procedure.Name,
                Notes = procedure.Notes,
                ProcCode = procedure.ProcCode,
                Type =procedure.Type,
                CreatedAt = procedure.CreatedAt,
                UpdatedAt = procedure.UpdatedAt
            };
        }
    }
} 