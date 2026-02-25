using System;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Api.Controllers
{
    /// <summary>
    /// Controller for managing patient report operations with enhanced error handling and security
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/patient-reports")]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public class PatientReportController : ControllerBase
    {
        private readonly IPatientReportService _patientReportService;
        private readonly ILogger<PatientReportController> _logger;

        public PatientReportController(IPatientReportService patientReportService, ILogger<PatientReportController> logger)
        {
            _patientReportService = patientReportService ?? throw new ArgumentNullException(nameof(patientReportService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves a patient report by ID
        /// </summary>
        /// <param name="id">Patient report ID</param>
        /// <returns>Patient report response DTO</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PatientReportResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PatientReportResponseDto>> GetById([Required] Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    _logger.LogWarning("Invalid patient report ID provided: {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Patient report ID cannot be empty" });
                }

                var patientReport = await _patientReportService.GetByIdAsync(id);
                return Ok(patientReport);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient report {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Patient report not found with ID {Id}", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving patient report {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while retrieving the patient report" });
            }
        }

        /// <summary>
        /// Retrieves all patient reports for a specific patient
        /// </summary>
        /// <param name="patientId">Patient ID</param>
        /// <returns>Collection of patient report response DTOs</returns>
        [HttpGet("patient/{patientId}")]
        [ProducesResponseType(typeof(IEnumerable<PatientReportResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<PatientReportResponseDto>>> GetByPatientId([Required] Guid patientId)
        {
            try
            {
                if (patientId == Guid.Empty)
                {
                    _logger.LogWarning("Invalid patient ID provided: {PatientId}", patientId);
                    return BadRequest(new { statusCode = 400, message = "Patient ID cannot be empty" });
                }

                var patientReports = await _patientReportService.GetByPatientIdAsync(patientId);
                return Ok(patientReports);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient {PatientId}", patientId);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving patient reports for patient {PatientId}", patientId);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while retrieving the patient reports" });
            }
        }

        /// <summary>
        /// Retrieves all patient reports for a specific doctor
        /// </summary>
        /// <param name="doctorId">Doctor ID</param>
        /// <returns>Collection of patient report response DTOs</returns>
        [HttpGet("doctor/{doctorId}")]
        [ProducesResponseType(typeof(IEnumerable<PatientReportResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<PatientReportResponseDto>>> GetByDoctorId([Required] Guid doctorId)
        {
            try
            {
                if (doctorId == Guid.Empty)
                {
                    _logger.LogWarning("Invalid doctor ID provided: {DoctorId}", doctorId);
                    return BadRequest(new { statusCode = 400, message = "Doctor ID cannot be empty" });
                }

                var patientReports = await _patientReportService.GetByDoctorIdAsync(doctorId);
                return Ok(patientReports);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for doctor {DoctorId}", doctorId);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving patient reports for doctor {DoctorId}", doctorId);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while retrieving the patient reports" });
            }
        }

        /// <summary>
        /// Creates a new patient report
        /// </summary>
        /// <param name="dto">Create patient report request DTO</param>
        /// <returns>Created patient report response DTO</returns>
        [HttpPost]
        [ProducesResponseType(typeof(PatientReportResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PatientReportResponseDto>> Create([FromBody] CreatePatientReportRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Null patient report data provided");
                    return BadRequest(new { statusCode = 400, message = "Patient report data cannot be null" });
                }

                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    _logger.LogWarning("Invalid model state for patient report creation: {Errors}", string.Join(", ", errors));
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided", errors });
                }

                var patientReport = await _patientReportService.CreateAsync(dto);

                _logger.LogInformation("Patient report created successfully with ID {Id}", patientReport.Id);
                return CreatedAtAction(nameof(GetById), new { id = patientReport.Id }, patientReport);
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Null argument provided for patient report creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient report creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during patient report creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating patient report");
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while creating the patient report" });
            }
        }

        /// <summary>
        /// Updates an existing patient report
        /// </summary>
        /// <param name="id">Patient report ID</param>
        /// <param name="dto">Update patient report request DTO</param>
        /// <returns>Updated patient report response DTO</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(PatientReportResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PatientReportResponseDto>> Update(
            [Required] Guid id,
            [FromBody] UpdatePatientReportRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Null update data provided for patient report {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Update data cannot be null" });
                }

                if (id == Guid.Empty)
                {
                    _logger.LogWarning("Invalid patient report ID provided: {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Patient report ID cannot be empty" });
                }

                if (id != dto.Id)
                {
                    _logger.LogWarning("Route ID {RouteId} does not match DTO ID {DtoId}", id, dto.Id);
                    return BadRequest(new { statusCode = 400, message = "ID in route does not match ID in request body" });
                }

                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    _logger.LogWarning("Invalid model state for patient report update: {Errors}", string.Join(", ", errors));
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided", errors });
                }

                var patientReport = await _patientReportService.UpdateAsync(dto);

                _logger.LogInformation("Patient report {Id} updated successfully", id);
                return Ok(patientReport);
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Null argument provided for patient report update {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient report update {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Patient report not found for update {Id}", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during patient report update {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error updating patient report {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while updating the patient report" });
            }
        }

        /// <summary>
        /// Deletes a patient report by ID
        /// </summary>
        /// <param name="id">Patient report ID</param>
        /// <returns>No content on successful deletion</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> Delete([Required] Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    _logger.LogWarning("Invalid patient report ID provided for deletion: {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Patient report ID cannot be empty" });
                }

                var result = await _patientReportService.DeleteAsync(id);

                _logger.LogInformation("Patient report {Id} deleted successfully", id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient report deletion {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Patient report not found for deletion {Id}", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Operation failed during patient report deletion {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while deleting the patient report" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error deleting patient report {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while deleting the patient report" });
            }
        }
    }
}

