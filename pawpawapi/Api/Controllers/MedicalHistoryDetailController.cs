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
    public class MedicalHistoryDetailController : ControllerBase
    {
        private readonly IMedicalHistoryDetailService _medicalHistoryDetailService;
        private readonly ILogger<MedicalHistoryDetailController> _logger;

        public MedicalHistoryDetailController(IMedicalHistoryDetailService medicalHistoryDetailService, ILogger<MedicalHistoryDetailController> logger)
        {
            _medicalHistoryDetailService = medicalHistoryDetailService ?? throw new ArgumentNullException(nameof(medicalHistoryDetailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalHistoryDetailResponseDto>> GetById(Guid id)
        {
            try
            {
                var medicalHistoryDetail = await _medicalHistoryDetailService.GetByIdAsync(id);
                return Ok(medicalHistoryDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Medical history detail not found with id {MedicalHistoryDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for medical history detail {MedicalHistoryDetailId}", id);
                return StatusCode(500, "An error occurred while retrieving the medical history detail");
            }
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<MedicalHistoryDetailResponseDto>> GetByPatientId(Guid patientId)
        {
            try
            {
                var medicalHistoryDetail = await _medicalHistoryDetailService.GetByPatientIdAsync(patientId);
                return Ok(medicalHistoryDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Medical history detail not found for patient {PatientId}", patientId);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByPatientId for patient {PatientId}", patientId);
                return StatusCode(500, "An error occurred while retrieving the medical history detail");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MedicalHistoryDetailResponseDto>> Create(CreateMedicalHistoryDetailRequestDto dto)
        {
            try
            {
                var medicalHistoryDetail = await _medicalHistoryDetailService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = medicalHistoryDetail.Id }, medicalHistoryDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, "An error occurred while creating the medical history detail");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MedicalHistoryDetailResponseDto>> Update(Guid id, UpdateMedicalHistoryDetailRequestDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return BadRequest("Id in route does not match id in request body");
                }

                var medicalHistoryDetail = await _medicalHistoryDetailService.UpdateAsync(dto);
                return Ok(medicalHistoryDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Medical history detail not found with id {MedicalHistoryDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update for medical history detail {MedicalHistoryDetailId}", id);
                return StatusCode(500, "An error occurred while updating the medical history detail");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _medicalHistoryDetailService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Medical history detail with id {id} not found");
                }
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Medical history detail not found with id {MedicalHistoryDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete for medical history detail {MedicalHistoryDetailId}", id);
                return StatusCode(500, "An error occurred while deleting the medical history detail");
            }
        }
    }
} 