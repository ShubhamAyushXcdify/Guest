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
    public class PrescriptionDetailController : ControllerBase
    {
        private readonly IPrescriptionDetailService _prescriptionDetailService;
        private readonly ILogger<PrescriptionDetailController> _logger;

        public PrescriptionDetailController(IPrescriptionDetailService prescriptionDetailService, ILogger<PrescriptionDetailController> logger)
        {
            _prescriptionDetailService = prescriptionDetailService ?? throw new ArgumentNullException(nameof(prescriptionDetailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PrescriptionDetailResponseDto>> GetById(Guid id)
        {
            try
            {
                var prescriptionDetail = await _prescriptionDetailService.GetByIdAsync(id);
                return Ok(prescriptionDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Prescription detail not found with id {PrescriptionDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for prescription detail {PrescriptionDetailId}", id);
                return StatusCode(500, "An error occurred while retrieving the prescription detail");
            }
        }

        [HttpGet("visit/{visitId}")]
        public async Task<ActionResult<PrescriptionDetailResponseDto>> GetByVisitId(Guid visitId)
        {
            try
            {
                var prescriptionDetail = await _prescriptionDetailService.GetByVisitIdAsync(visitId);
                return Ok(prescriptionDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Prescription detail not found for visit {VisitId}", visitId);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitId for visit {VisitId}", visitId);
                return StatusCode(500, "An error occurred while retrieving the prescription detail");
            }
        }

        [HttpPost]
        public async Task<ActionResult<PrescriptionDetailResponseDto>> Create(CreatePrescriptionDetailRequestDto dto)
        {
            try
            {
                var prescriptionDetail = await _prescriptionDetailService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = prescriptionDetail.Id }, prescriptionDetail);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while creating prescription detail");
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found while creating prescription detail");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, new { message = "An error occurred while creating the prescription detail", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PrescriptionDetailResponseDto>> Update(Guid id, UpdatePrescriptionDetailRequestDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return BadRequest("Id in route does not match id in request body");
                }

                var prescriptionDetail = await _prescriptionDetailService.UpdateAsync(dto);
                return Ok(prescriptionDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Prescription detail not found with id {PrescriptionDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while updating prescription detail {PrescriptionDetailId}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update for prescription detail {PrescriptionDetailId}", id);
                return StatusCode(500, "An error occurred while updating the prescription detail");
            }
        }

        [HttpGet("debug-inventory/{purchaseOrderReceivingHistoryId}")]
        public async Task<ActionResult> DebugInventory(Guid purchaseOrderReceivingHistoryId)
        {
            try
            {
                var result = await _prescriptionDetailService.DebugInventoryAsync(purchaseOrderReceivingHistoryId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DebugInventory");
                return StatusCode(500, new { message = "An error occurred while debugging inventory", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _prescriptionDetailService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Prescription detail with id {id} not found");
                }
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Prescription detail not found with id {PrescriptionDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete for prescription detail {PrescriptionDetailId}", id);
                return StatusCode(500, "An error occurred while deleting the prescription detail");
            }
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<List<PrescriptionDetailFullResponseDto>>> GetByPatientId(Guid patientId)
        {
            try
            {
                var details = await _prescriptionDetailService.GetByPatientIdAsync(patientId);
                return Ok(details);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByPatientId for patient {PatientId}", patientId);
                return StatusCode(500, "An error occurred while retrieving prescription details for the patient");
            }
        }

        [HttpGet("pdf/visit/{visitId}")]
        public async Task<ActionResult<PrescriptionPdfResponseDto>> GeneratePrescriptionPdf(Guid visitId)
        {
            try
            {
                var pdfResponse = await _prescriptionDetailService.GeneratePrescriptionPdfAsync(visitId);
                return Ok(pdfResponse);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Visit not found for PDF generation: {VisitId}", visitId);
                return NotFound($"Visit with ID {visitId} not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating prescription PDF for visit {VisitId}", visitId);
                return StatusCode(500, "An error occurred while generating the prescription PDF");
            }
        }
    }
}