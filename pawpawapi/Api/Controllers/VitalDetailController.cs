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
    public class VitalDetailController : ControllerBase
    {
        private readonly IVitalDetailService _vitalDetailService;
        private readonly ILogger<VitalDetailController> _logger;

        public VitalDetailController(IVitalDetailService vitalDetailService, ILogger<VitalDetailController> logger)
        {
            _vitalDetailService = vitalDetailService ?? throw new ArgumentNullException(nameof(vitalDetailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VitalDetailResponseDto>> GetById(Guid id)
        {
            try
            {
                var vitalDetail = await _vitalDetailService.GetByIdAsync(id);
                return Ok(vitalDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Vital detail not found with id {VitalDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for vital detail {VitalDetailId}", id);
                return StatusCode(500, "An error occurred while retrieving the vital detail");
            }
        }

        [HttpGet("visit/{visitId}")]
        public async Task<ActionResult<VitalDetailResponseDto>> GetByVisitId(Guid visitId)
        {
            try
            {
                var vitalDetail = await _vitalDetailService.GetByVisitIdAsync(visitId);
                return Ok(vitalDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Vital detail not found for visit {VisitId}", visitId);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitId for visit {VisitId}", visitId);
                return StatusCode(500, "An error occurred while retrieving the vital detail");
            }
        }

        [HttpPost]
        public async Task<ActionResult<VitalDetailResponseDto>> Create(CreateVitalDetailRequestDto dto)
        {
            try
            {
                var vitalDetail = await _vitalDetailService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = vitalDetail.Id }, vitalDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, "An error occurred while creating the vital detail");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<VitalDetailResponseDto>> Update(Guid id, UpdateVitalDetailRequestDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return BadRequest("Id in route does not match id in request body");
                }

                var vitalDetail = await _vitalDetailService.UpdateAsync(dto);
                return Ok(vitalDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Vital detail not found with id {VitalDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update for vital detail {VitalDetailId}", id);
                return StatusCode(500, "An error occurred while updating the vital detail");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _vitalDetailService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Vital detail with id {id} not found");
                }
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Vital detail not found with id {VitalDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete for vital detail {VitalDetailId}", id);
                return StatusCode(500, "An error occurred while deleting the vital detail");
            }
        }
    }
} 