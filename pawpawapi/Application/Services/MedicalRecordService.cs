using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly IMedicalRecordRepository _medicalRecordRepository;
        private readonly IClinicService _clinicService;
        private readonly IPatientService _patientService;
        private readonly IAppointmentService _appointmentService;
        private readonly IUserService _userService;
        private readonly IMapper _mapper;
        private readonly ILogger<MedicalRecordService> _logger;

        public MedicalRecordService(
            IMedicalRecordRepository medicalRecordRepository,
            IClinicService clinicService,
            IPatientService patientService,
            IAppointmentService appointmentService,
            IUserService userService,
            IMapper mapper,
            ILogger<MedicalRecordService> logger)
        {
            _medicalRecordRepository = medicalRecordRepository ?? throw new ArgumentNullException(nameof(medicalRecordRepository));
            _clinicService = clinicService ?? throw new ArgumentNullException(nameof(clinicService));
            _patientService = patientService ?? throw new ArgumentNullException(nameof(patientService));
            _appointmentService = appointmentService ?? throw new ArgumentNullException(nameof(appointmentService));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<MedicalRecordResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                var medicalRecord = await _medicalRecordRepository.GetByIdAsync(id);
                if (medicalRecord == null)
                {
                    throw new KeyNotFoundException($"Medical record with id {id} not found");
                }

                var dto = _mapper.Map<MedicalRecordResponseDto>(medicalRecord);
                await PopulateRelatedData(dto);
                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for medical record {MedicalRecordId}", id);
                throw;
            }
        }

        public async Task<PaginatedResponseDto<MedicalRecordResponseDto>> GetAllAsync(
            int pageNumber = 1, 
            int pageSize = 10,
            Guid? clinicId = null,
            Guid? patientId = null,
            Guid? appointmentId = null,
            Guid? veterinarianId = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null)
        {
            try
            {
                var (medicalRecords, totalCount) = await _medicalRecordRepository.GetAllAsync(
                    pageNumber, 
                    pageSize,
                    clinicId,
                    patientId,
                    appointmentId,
                    veterinarianId,
                    dateFrom,
                    dateTo);

                var dtos = _mapper.Map<IEnumerable<MedicalRecordResponseDto>>(medicalRecords).ToList();
                
                foreach (var dto in dtos)
                {
                    await PopulateRelatedData(dto);
                }

                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
                
                return new PaginatedResponseDto<MedicalRecordResponseDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = totalPages,
                    HasPreviousPage = pageNumber > 1,
                    HasNextPage = pageNumber < totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        private async Task PopulateRelatedData(MedicalRecordResponseDto dto)
        {
            if (dto.ClinicId.HasValue)
            {
                dto.Clinic = await _clinicService.GetByIdAsync(dto.ClinicId.Value);
            }

            if (dto.PatientId.HasValue)
            {
                dto.Patient = await _patientService.GetByIdAsync(dto.PatientId.Value);
            }

            if (dto.AppointmentId.HasValue)
            {
                dto.Appointment = await _appointmentService.GetByIdAsync(dto.AppointmentId.Value);
            }

            if (dto.VeterinarianId.HasValue)
            {
                dto.Veterinarian = await _userService.GetByIdAsync(dto.VeterinarianId.Value);
            }
        }

        public async Task<MedicalRecordResponseDto> CreateAsync(CreateMedicalRecordRequestDto dto)
        {
            try
            {
                var medicalRecord = _mapper.Map<MedicalRecord>(dto);
                var createdMedicalRecord = await _medicalRecordRepository.CreateAsync(medicalRecord);
                var responseDto = _mapper.Map<MedicalRecordResponseDto>(createdMedicalRecord);
                await PopulateRelatedData(responseDto);
                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw;
            }
        }

        public async Task<MedicalRecordResponseDto> UpdateAsync(UpdateMedicalRecordRequestDto dto)
        {
            try
            {
                var existingMedicalRecord = await _medicalRecordRepository.GetByIdAsync(dto.Id);
                if (existingMedicalRecord == null)
                {
                    throw new KeyNotFoundException($"Medical record with id {dto.Id} not found");
                }

                existingMedicalRecord.ClinicId = dto.ClinicId;
                existingMedicalRecord.PatientId = dto.PatientId;
                existingMedicalRecord.AppointmentId = dto.AppointmentId;
                existingMedicalRecord.VeterinarianId = dto.VeterinarianId;
                existingMedicalRecord.VisitDate = dto.VisitDate;
                existingMedicalRecord.ChiefComplaint = dto.ChiefComplaint;
                existingMedicalRecord.History = dto.History;
                existingMedicalRecord.PhysicalExamFindings = dto.PhysicalExamFindings;
                existingMedicalRecord.Diagnosis = dto.Diagnosis;
                existingMedicalRecord.TreatmentPlan = dto.TreatmentPlan;
                existingMedicalRecord.FollowUpInstructions = dto.FollowUpInstructions;
                existingMedicalRecord.WeightKg = dto.WeightKg;
                existingMedicalRecord.TemperatureCelsius = dto.TemperatureCelsius;
                existingMedicalRecord.HeartRate = dto.HeartRate;
                existingMedicalRecord.RespiratoryRate = dto.RespiratoryRate;

                var updatedMedicalRecord = await _medicalRecordRepository.UpdateAsync(existingMedicalRecord);
                var responseDto = _mapper.Map<MedicalRecordResponseDto>(updatedMedicalRecord);
                await PopulateRelatedData(responseDto);
                return responseDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for medical record {MedicalRecordId}", dto.Id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var existingMedicalRecord = await _medicalRecordRepository.GetByIdAsync(id);
                if (existingMedicalRecord == null)
                {
                    throw new KeyNotFoundException($"Medical record with id {id} not found");
                }

                return await _medicalRecordRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for medical record {MedicalRecordId}", id);
                throw;
            }
        }
    }
} 