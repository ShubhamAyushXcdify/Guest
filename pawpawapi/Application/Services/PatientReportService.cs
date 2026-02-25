using System;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace Application.Services
{
    /// <summary>
    /// Service for managing patient report operations
    /// </summary>
    public class PatientReportService : IPatientReportService
    {
        private readonly IPatientReportRepository _patientReportRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<PatientReportService> _logger;

        public PatientReportService(
            IPatientReportRepository patientReportRepository,
            IPatientRepository patientRepository,
            IMapper mapper,
            ILogger<PatientReportService> logger)
        {
            _patientReportRepository = patientReportRepository ?? throw new ArgumentNullException(nameof(patientReportRepository));
            _patientRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves a patient report by ID
        /// </summary>
        /// <param name="id">Patient report ID</param>
        /// <returns>Patient report response DTO</returns>
        public async Task<PatientReportResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Patient report ID cannot be empty", nameof(id));

                _logger.LogDebug("Retrieving patient report {Id}", id);

                var patientReport = await _patientReportRepository.GetByIdAsync(id);
                if (patientReport == null)
                {
                    _logger.LogWarning("Patient report {Id} not found", id);
                    throw new KeyNotFoundException($"Patient report with ID {id} not found");
                }

                var result = _mapper.Map<PatientReportResponseDto>(patientReport);

                _logger.LogDebug("Successfully retrieved patient report {Id}", id);
                return result;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve patient report {Id}", id);
                throw new InvalidOperationException("An error occurred while retrieving the patient report", ex);
            }
        }

        /// <summary>
        /// Retrieves all patient reports for a specific patient
        /// </summary>
        /// <param name="patientId">Patient ID</param>
        /// <returns>Collection of patient report response DTOs</returns>
        public async Task<IEnumerable<PatientReportResponseDto>> GetByPatientIdAsync(Guid patientId)
        {
            try
            {
                if (patientId == Guid.Empty)
                    throw new ArgumentException("Patient ID cannot be empty", nameof(patientId));

                _logger.LogDebug("Retrieving patient reports for patient {PatientId}", patientId);

                // Validate patient exists
                await ValidatePatientExistsAsync(patientId);

                var patientReports = await _patientReportRepository.GetByPatientIdAsync(patientId);

                var results = _mapper.Map<IEnumerable<PatientReportResponseDto>>(patientReports);

                _logger.LogDebug("Successfully retrieved patient reports for patient {PatientId}", patientId);
                return results;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve patient reports for patient {PatientId}", patientId);
                throw new InvalidOperationException("An error occurred while retrieving the patient reports", ex);
            }
        }

        /// <summary>
        /// Retrieves all patient reports for a specific doctor
        /// </summary>
        /// <param name="doctorId">Doctor ID</param>
        /// <returns>Collection of patient report response DTOs</returns>
        public async Task<IEnumerable<PatientReportResponseDto>> GetByDoctorIdAsync(Guid doctorId)
        {
            try
            {
                if (doctorId == Guid.Empty)
                    throw new ArgumentException("Doctor ID cannot be empty", nameof(doctorId));

                _logger.LogDebug("Retrieving patient reports for doctor {DoctorId}", doctorId);

                var patientReports = await _patientReportRepository.GetByDoctorIdAsync(doctorId);

                var results = _mapper.Map<IEnumerable<PatientReportResponseDto>>(patientReports);

                _logger.LogDebug("Successfully retrieved patient reports for doctor {DoctorId}", doctorId);
                return results;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve patient reports for doctor {DoctorId}", doctorId);
                throw new InvalidOperationException("An error occurred while retrieving the patient reports", ex);
            }
        }

        /// <summary>
        /// Creates a new patient report
        /// </summary>
        /// <param name="dto">Create patient report request DTO</param>
        /// <returns>Created patient report response DTO</returns>
        public async Task<PatientReportResponseDto> CreateAsync(CreatePatientReportRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto), "Patient report data cannot be null");

                _logger.LogDebug("Creating patient report for patient {PatientId}", dto.PatientId);

                // Comprehensive validation
                await ValidateCreateRequestAsync(dto);

                // Create patient report entity
                var patientReport = _mapper.Map<PatientReport>(dto);
                var createdReport = await _patientReportRepository.CreateAsync(patientReport);

                // Return complete result
                var result = await GetByIdAsync(createdReport.Id);

                _logger.LogInformation("Patient report created successfully with ID {Id} for patient {PatientId}",
                    createdReport.Id, dto.PatientId);

                return result;
            }
            catch (ArgumentNullException)
            {
                throw;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create patient report for patient {PatientId}", dto?.PatientId);
                throw new InvalidOperationException("An error occurred while creating the patient report", ex);
            }
        }

        /// <summary>
        /// Updates an existing patient report
        /// </summary>
        /// <param name="dto">Update patient report request DTO</param>
        /// <returns>Updated patient report response DTO</returns>
        public async Task<PatientReportResponseDto> UpdateAsync(UpdatePatientReportRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto), "Update data cannot be null");

                _logger.LogDebug("Updating patient report {Id}", dto.Id);

                // Comprehensive validation
                await ValidateUpdateRequestAsync(dto);

                // Get existing patient report for validation
                var existingReport = await _patientReportRepository.GetByIdAsync(dto.Id);
                if (existingReport == null)
                {
                    _logger.LogWarning("Patient report {Id} not found for update", dto.Id);
                    throw new KeyNotFoundException($"Patient report with ID {dto.Id} not found");
                }

                // Update patient report
                var patientReport = _mapper.Map<PatientReport>(dto);
                patientReport.PatientId = existingReport.PatientId; // Preserve patient ID
                patientReport.DoctorId = existingReport.DoctorId; // Preserve doctor ID
                patientReport.CreatedById = existingReport.CreatedById; // Preserve created by ID
                var updatedReport = await _patientReportRepository.UpdateAsync(patientReport);

                // Return complete result
                var result = await GetByIdAsync(updatedReport.Id);

                _logger.LogInformation("Patient report {Id} updated successfully", dto.Id);
                return result;
            }
            catch (ArgumentNullException)
            {
                throw;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update patient report {Id}", dto?.Id);
                throw new InvalidOperationException("An error occurred while updating the patient report", ex);
            }
        }

        /// <summary>
        /// Deletes a patient report
        /// </summary>
        /// <param name="id">Patient report ID</param>
        /// <returns>True if deleted successfully</returns>
        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Patient report ID cannot be empty", nameof(id));

                _logger.LogDebug("Deleting patient report {Id}", id);

                var existingReport = await _patientReportRepository.GetByIdAsync(id);
                if (existingReport == null)
                {
                    _logger.LogWarning("Patient report {Id} not found for deletion", id);
                    throw new KeyNotFoundException($"Patient report with ID {id} not found");
                }

                // Delete the patient report
                var result = await _patientReportRepository.DeleteAsync(id);

                _logger.LogInformation("Patient report {Id} deleted successfully", id);
                return result;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete patient report {Id}", id);
                throw new InvalidOperationException("An error occurred while deleting the patient report", ex);
            }
        }

        #region Validation Methods

        /// <summary>
        /// Validates create request data
        /// </summary>
        private async Task ValidateCreateRequestAsync(CreatePatientReportRequestDto dto)
        {
            if (dto.PatientId == Guid.Empty)
                throw new ArgumentException("Patient ID cannot be empty", nameof(dto.PatientId));

            if (dto.DoctorId == Guid.Empty)
                throw new ArgumentException("Doctor ID cannot be empty", nameof(dto.DoctorId));

            if (dto.CreatedById == Guid.Empty)
                throw new ArgumentException("Created By ID cannot be empty", nameof(dto.CreatedById));

                // Validate patient exists
                await ValidatePatientExistsAsync(dto.PatientId);

                // Validate HTML file content
            if (string.IsNullOrWhiteSpace(dto.HtmlFile))
                throw new ArgumentException("HTML File content cannot be empty", nameof(dto.HtmlFile));
        }

        /// <summary>
        /// Validates update request data
        /// </summary>
        private async Task ValidateUpdateRequestAsync(UpdatePatientReportRequestDto dto)
        {
            if (dto.Id == Guid.Empty)
                throw new ArgumentException("Patient report ID cannot be empty", nameof(dto.Id));

            // Validate HTML file content
            if (string.IsNullOrWhiteSpace(dto.HtmlFile))
                throw new ArgumentException("HTML File content cannot be empty", nameof(dto.HtmlFile));
        }

        /// <summary>
        /// Validates that a patient exists
        /// </summary>
        private async Task ValidatePatientExistsAsync(Guid patientId)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                _logger.LogWarning("Patient {PatientId} not found", patientId);
                throw new ArgumentException($"Patient with ID {patientId} does not exist", nameof(patientId));
            }
        }

        #endregion
    }
}

