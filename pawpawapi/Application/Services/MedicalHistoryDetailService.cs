using System;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Repositories;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class MedicalHistoryDetailService : IMedicalHistoryDetailService
    {
        private readonly IMedicalHistoryDetailRepository _medicalHistoryDetailRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<MedicalHistoryDetailService> _logger;

        public MedicalHistoryDetailService(
            IMedicalHistoryDetailRepository medicalHistoryDetailRepository,
            IMapper mapper,
            ILogger<MedicalHistoryDetailService> logger)
        {
            _medicalHistoryDetailRepository = medicalHistoryDetailRepository ?? throw new ArgumentNullException(nameof(medicalHistoryDetailRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<MedicalHistoryDetailResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var medicalHistoryDetail = await _medicalHistoryDetailRepository.GetByIdAsync(id);
                if (medicalHistoryDetail == null)
                {
                    throw new KeyNotFoundException($"Medical history detail with id {id} not found");
                }

                return _mapper.Map<MedicalHistoryDetailResponseDto>(medicalHistoryDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for medical history detail {MedicalHistoryDetailId}", id);
                throw;
            }
        }

        public async Task<MedicalHistoryDetailResponseDto> GetByPatientIdAsync(Guid patientId)
        {
            try
            {
                var medicalHistoryDetail = await _medicalHistoryDetailRepository.GetByPatientIdAsync(patientId);
                if (medicalHistoryDetail == null)
                {
                    throw new KeyNotFoundException($"Medical history detail for patient {patientId} not found");
                }

                return _mapper.Map<MedicalHistoryDetailResponseDto>(medicalHistoryDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByPatientIdAsync for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<MedicalHistoryDetailResponseDto> CreateAsync(CreateMedicalHistoryDetailRequestDto dto)
        {
            try
            {
                var medicalHistoryDetail = new MedicalHistoryDetail
                {
                    PatientId = dto.PatientId,
                    ChronicConditionsNotes = dto.ChronicConditionsNotes,
                    SurgeriesNotes = dto.SurgeriesNotes,
                    CurrentMedicationsNotes = dto.CurrentMedicationsNotes,
                    GeneralNotes = dto.GeneralNotes,
                    IsCompleted = dto.IsCompleted
                };

                var createdMedicalHistoryDetail = await _medicalHistoryDetailRepository.CreateAsync(medicalHistoryDetail);

                return _mapper.Map<MedicalHistoryDetailResponseDto>(createdMedicalHistoryDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw;
            }
        }

        public async Task<MedicalHistoryDetailResponseDto> UpdateAsync(UpdateMedicalHistoryDetailRequestDto dto)
        {
            try
            {
                var existingMedicalHistoryDetail = await _medicalHistoryDetailRepository.GetByIdAsync(dto.Id);
                if (existingMedicalHistoryDetail == null)
                {
                    throw new KeyNotFoundException($"Medical history detail with id {dto.Id} not found");
                }

                _mapper.Map(dto, existingMedicalHistoryDetail);
                var updatedMedicalHistoryDetail = await _medicalHistoryDetailRepository.UpdateAsync(existingMedicalHistoryDetail);
                
                return _mapper.Map<MedicalHistoryDetailResponseDto>(updatedMedicalHistoryDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for medical history detail {MedicalHistoryDetailId}", dto.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingMedicalHistoryDetail = await _medicalHistoryDetailRepository.GetByIdAsync(id);
                if (existingMedicalHistoryDetail == null)
                {
                    throw new KeyNotFoundException($"Medical history detail with id {id} not found");
                }

                return await _medicalHistoryDetailRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for medical history detail {MedicalHistoryDetailId}", id);
                throw;
            }
        }
    }
} 