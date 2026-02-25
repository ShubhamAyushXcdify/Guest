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
    public class SymptomService : ISymptomService
    {
        private readonly ISymptomRepository _symptomRepository;
        private readonly ILogger<SymptomService> _logger;

        public SymptomService(ISymptomRepository symptomRepository, ILogger<SymptomService> logger)
        {
            _symptomRepository = symptomRepository ?? throw new ArgumentNullException(nameof(symptomRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<SymptomResponseDto> CreateAsync(CreateSymptomRequestDto request)
        {
            try
            {
                var symptom = new Symptom
                {
                    Name = request.Name,
                    Notes = request.Notes,
                    IsComman = request.IsComman,
                    Breed = request.Breed
                };

                var createdSymptom = await _symptomRepository.CreateAsync(symptom);
                return MapToResponseDto(createdSymptom);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating symptom");
                throw new InvalidOperationException("Failed to create symptom", ex);
            }
        }

        public async Task<IEnumerable<SymptomResponseDto>> GetAllAsync()
        {
            try
            {
                var symptoms = await _symptomRepository.GetAllAsync();
                return symptoms.Select(MapToResponseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all symptoms");
                throw new InvalidOperationException("Failed to get symptoms", ex);
            }
        }

        public async Task<IEnumerable<SymptomResponseDto>> GetByBreedAsync(string? breed)
        {
            try
            {
                var symptoms = await _symptomRepository.GetByBreedAsync(breed);
                return symptoms.Select(MapToResponseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting symptoms by breed {Breed}", breed);
                throw new InvalidOperationException($"Failed to get symptoms for breed {breed}", ex);
            }
        }

        public async Task<SymptomResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var symptom = await _symptomRepository.GetByIdAsync(id);
                if (symptom == null)
                {
                    throw new KeyNotFoundException($"Symptom with id {id} not found");
                }
                return MapToResponseDto(symptom);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting symptom {SymptomId}", id);
                throw new InvalidOperationException($"Failed to get symptom with id {id}", ex);
            }
        }

        public async Task<SymptomResponseDto> UpdateAsync(UpdateSymptomRequestDto request)
        {
            try
            {
                var existingSymptom = await _symptomRepository.GetByIdAsync(request.Id);
                if (existingSymptom == null)
                {
                    throw new KeyNotFoundException($"Symptom with id {request.Id} not found");
                }

                existingSymptom.Name = request.Name;
                existingSymptom.Notes = request.Notes;
                existingSymptom.IsComman = request.IsComman;
                existingSymptom.Breed = request.Breed;

                var updatedSymptom = await _symptomRepository.UpdateAsync(existingSymptom);
                return MapToResponseDto(updatedSymptom);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating symptom {SymptomId}", request.Id);
                throw new InvalidOperationException($"Failed to update symptom with id {request.Id}", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingSymptom = await _symptomRepository.GetByIdAsync(id);
                if (existingSymptom == null)
                {
                    throw new KeyNotFoundException($"Symptom with id {id} not found");
                }

                return await _symptomRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting symptom {SymptomId}", id);
                throw new InvalidOperationException($"Failed to delete symptom with id {id}", ex);
            }
        }

        private static SymptomResponseDto MapToResponseDto(Symptom symptom)
        {
            return new SymptomResponseDto
            {
                Id = symptom.Id,
                Name = symptom.Name,
                Notes = symptom.Notes,
                IsComman = symptom.IsComman,
                Breed = symptom.Breed,
                CreatedAt = symptom.CreatedAt,
                UpdatedAt = symptom.UpdatedAt
            };
        }
    }
} 