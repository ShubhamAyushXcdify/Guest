using System;
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
    public class MedicalRecordController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalRecordService;
        private readonly ILogger<MedicalRecordController> _logger;

        public MedicalRecordController(IMedicalRecordService medicalRecordService, ILogger<MedicalRecordController> logger)
        {
            _medicalRecordService = medicalRecordService ?? throw new ArgumentNullException(nameof(medicalRecordService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<MedicalRecordResponseDto>>> GetAll(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] Guid? clinicId = null,
            [FromQuery] Guid? patientId = null,
            [FromQuery] Guid? appointmentId = null,
            [FromQuery] Guid? veterinarianId = null,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null)
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

                var medicalRecords = await _medicalRecordService.GetAllAsync(
                    pageNumber,
                    pageSize,
                    clinicId,
                    patientId,
                    appointmentId,
                    veterinarianId,
                    dateFrom,
                    dateTo);

                return Ok(medicalRecords);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAll");
                return StatusCode(500, "An error occurred while retrieving medical records");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalRecordResponseDto>> GetById(Guid id)
        {
            try
            {
                var medicalRecord = await _medicalRecordService.GetByIdAsync(id);
                return Ok(medicalRecord);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Medical record not found with id {MedicalRecordId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for medical record {MedicalRecordId}", id);
                return StatusCode(500, "An error occurred while retrieving the medical record");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MedicalRecordResponseDto>> Create(CreateMedicalRecordRequestDto dto)
        {
            try
            {
                var medicalRecord = await _medicalRecordService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = medicalRecord.Id }, medicalRecord);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, "An error occurred while creating the medical record");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MedicalRecordResponseDto>> Update(Guid id, UpdateMedicalRecordRequestDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return BadRequest("Id in route does not match id in request body");
                }

                var medicalRecord = await _medicalRecordService.UpdateAsync(dto);
                return Ok(medicalRecord);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Medical record not found with id {MedicalRecordId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update for medical record {MedicalRecordId}", id);
                return StatusCode(500, "An error occurred while updating the medical record");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _medicalRecordService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Medical record with id {id} not found");
                }
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Medical record not found with id {MedicalRecordId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete for medical record {MedicalRecordId}", id);
                return StatusCode(500, "An error occurred while deleting the medical record");
            }
        }
    }
} 