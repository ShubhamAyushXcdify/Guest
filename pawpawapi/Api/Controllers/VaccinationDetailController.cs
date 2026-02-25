using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VaccinationDetailController : ControllerBase
    {
        private readonly IVaccinationDetailService _service;
        private readonly ILogger<VaccinationDetailController> _logger;

        public VaccinationDetailController(IVaccinationDetailService service, ILogger<VaccinationDetailController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VaccinationDetailResponseDto>> GetById(Guid id)
        {
            try
            {
                var detail = await _service.GetByIdAsync(id);
                if (detail == null) return NotFound();
                return Ok(detail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for vaccination detail {VaccinationDetailId}", id);
                return StatusCode(500, "An error occurred while retrieving the vaccination detail");
            }
        }

        [HttpGet("visit/{visitId}")]
        public async Task<ActionResult<IEnumerable<VaccinationDetailResponseDto>>> GetByVisitId(Guid visitId)
        {
            try
            {
                var details = await _service.GetByVisitIdAsync(visitId);
                return Ok(details);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitId for visit {VisitId}", visitId);
                return StatusCode(500, "An error occurred while retrieving the vaccination details");
            }
        }

        [HttpGet("by-visit-master")]
        public async Task<ActionResult<object>> GetByVisitAndMaster([FromQuery] Guid visitId, [FromQuery] Guid vaccinationMasterId)
        {
            var details = await _service.GetByVisitIdAsync(visitId);
            var detail = details.FirstOrDefault(d => d.VaccinationMasterIdsDetails.Any(m => m.Id == vaccinationMasterId));
            if (detail == null)
                return NotFound("Vaccination detail not found for the given visit and master.");

            var vaccinationJson = await _service.GetVaccinationJsonAsync(detail.Id, vaccinationMasterId);
            return Ok(new
            {
                detail.Id,
                detail.VisitId,
                detail.Notes,
                detail.IsCompleted,
                VaccinationJson = vaccinationJson
            });
        }

        [HttpPost]
        public async Task<ActionResult<VaccinationDetailResponseDto>> Create([FromBody] CreateVaccinationDetailRequestDto dto)
        {
            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, "An error occurred while creating the vaccination detail");
            }
        }

        // Removed batch creation endpoint

        [HttpPut("{id}")]
        public async Task<ActionResult<VaccinationDetailResponseDto>> Update(Guid id, [FromBody] UpdateVaccinationDetailRequestDto dto)
        {
            try
            {
                if (id != dto.Id) return BadRequest("Id mismatch");
                var updated = await _service.UpdateAsync(dto);
                if (updated == null) return NotFound();
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update for vaccination detail {VaccinationDetailId}", id);
                return StatusCode(500, "An error occurred while updating the vaccination detail");
            }
        }

        [HttpPut("batch")]
        public async Task<IActionResult> BatchUpdate([FromBody] BatchUpdateVaccinationDetailRequestDto dto)
        {
            try
            {
                // Find the vaccination_detail_id for the given visit and master
                var details = await _service.GetByVisitIdAsync(dto.VisitId);
                var detail = details.FirstOrDefault(d => d.VaccinationMasterIdsDetails.Any(m => m.Id == dto.VaccinationMasterId));
                if (detail == null)
                    return NotFound("Vaccination detail not found for the given visit and master.");

                var updated = await _service.UpdateVaccinationJsonAsync(detail.Id, dto.VaccinationMasterId, dto.VaccinationJson);
                if (!updated)
                    return StatusCode(500, "Failed to update vaccination_json.");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in BatchUpdate for visit {VisitId} and master {VaccinationMasterId}", dto.VisitId, dto.VaccinationMasterId);
                return StatusCode(500, "An error occurred while updating the vaccination detail batch.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete for vaccination detail {VaccinationDetailId}", id);
                return StatusCode(500, "An error occurred while deleting the vaccination detail");
            }
        }
    }
} 