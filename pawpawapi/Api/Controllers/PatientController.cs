using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;
        private readonly ILogger<PatientController> _logger;

        public PatientController(IPatientService patientService, ILogger<PatientController> logger)
        {
            _patientService = patientService ?? throw new ArgumentNullException(nameof(patientService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<PatientResponseDto>>> GetAll(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] Guid? patientId = null,
            [FromQuery] Guid? clientId = null,
            [FromQuery] Guid? medicalRecordId = null,
            [FromQuery] bool paginationRequired = true,
            [FromQuery] Guid? companyId = null,
            [FromQuery] string? search = null)
        {
            try
            {
                if (pageNumber < 1)
                {
                    return BadRequest("Page number must be greater than 0");
                }

                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest("Page size must be between 1 and 100");
                }

                var patients = await _patientService.GetAllAsync(
                    pageNumber,
                    pageSize,
                    patientId,
                    clientId,
                    medicalRecordId,
                    paginationRequired,
                    companyId,
                    search);

                return Ok(patients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAll");
                return StatusCode(500, "An error occurred while retrieving patients");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<PatientResponseDto>>> Search(
            [FromQuery] string query,
            [FromQuery] string type,
             [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] Guid? companyId = null
           )
        {
            try
            {
                var patients = await _patientService.SearchAsync(query, type, page, pageSize, companyId);
                return Ok(patients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Search");
                return StatusCode(500, "An error occurred while searching for patients");
            }
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<PatientResponseDto>> GetById(Guid id)
        {
            try
            {
                var patient = await _patientService.GetByIdAsync(id);
                if (patient == null) return NotFound();
                return Ok(patient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for patient {PatientId}", id);
                return StatusCode(500, "An error occurred while retrieving the patient");
            }
        }

        [HttpGet("{id}/visitdetails")]
        [ProducesResponseType(200, Type = typeof(PatientVisitDetailsResponseDto))]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetPatientVisitDetails(Guid id)
        {
            try
            {
                var patientVisitDetails = await _patientService.GetPatientVisitDetailsAsync(id);
                return Ok(patientVisitDetails);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Patient visit details not found for patient {PatientId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPatientVisitDetails for patient {PatientId}", id);
                return StatusCode(500, "An error occurred while retrieving patient visit details");
            }
        }

        [HttpGet("{id}/weight-history")]
        [ProducesResponseType(200, Type = typeof(PatientWeightHistoryResponseDto))]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetPatientWeightHistory(Guid id)
        {
            try
            {
                var weightHistory = await _patientService.GetPatientWeightHistoryAsync(id);
                return Ok(weightHistory);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Patient weight history not found for patient {PatientId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPatientWeightHistory for patient {PatientId}", id);
                return StatusCode(500, "An error occurred while retrieving patient weight history");
            }
        }

        /// <summary>
        /// Get appointment history for a patient. Optionally filter by clinic ID.
        /// </summary>
        /// <param name="id">Patient ID</param>
        /// <param name="clinicId">Optional clinic ID to filter appointments by clinic</param>
        [HttpGet("{id}/appointment-history")]
        [ProducesResponseType(200, Type = typeof(PatientAppointmentHistoryResponseDto))]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetPatientAppointmentHistory(Guid id, [FromQuery] Guid? clinicId = null)
        {
            try
            {
                var appointmentHistory = await _patientService.GetPatientAppointmentHistoryAsync(id, clinicId);
                return Ok(appointmentHistory);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Patient appointment history not found for patient {PatientId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPatientAppointmentHistory for patient {PatientId}", id);
                return StatusCode(500, "An error occurred while retrieving patient appointment history");
            }
        }

        [HttpPost]
        public async Task<ActionResult<PatientResponseDto>> Create([FromBody] CreatePatientRequestDto dto)
        {
            try
            {
                var created = await _patientService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, "An error occurred while creating the patient");
            }
        }

        [HttpPut]
        public async Task<ActionResult<PatientResponseDto>> Update([FromBody] UpdatePatientRequestDto dto)
        {
            try
            {
                var updated = await _patientService.UpdateAsync(dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update");
                return StatusCode(500, "An error occurred while updating the patient");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _patientService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete for patient {PatientId}", id);
                return StatusCode(500, "An error occurred while deleting the patient");
            }
        }
    }
} 