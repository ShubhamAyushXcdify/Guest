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
    public class SurgeryVisitController : ControllerBase
    {
        private readonly ISurgeryPreOpService _preOpService;
        private readonly ISurgeryDetailService _detailService;
        private readonly ISurgeryPostOpService _postOpService;
        private readonly ISurgeryDischargeService _dischargeService;
        private readonly ILogger<SurgeryVisitController> _logger;

        public SurgeryVisitController(
            ISurgeryPreOpService preOpService,
            ISurgeryDetailService detailService,
            ISurgeryPostOpService postOpService,
            ISurgeryDischargeService dischargeService,
            ILogger<SurgeryVisitController> logger)
        {
            _preOpService = preOpService ?? throw new ArgumentNullException(nameof(preOpService));
            _detailService = detailService ?? throw new ArgumentNullException(nameof(detailService));
            _postOpService = postOpService ?? throw new ArgumentNullException(nameof(postOpService));
            _dischargeService = dischargeService ?? throw new ArgumentNullException(nameof(dischargeService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // --- Surgery PreOp Endpoints ---

        [HttpGet("preop/{id}")]
        public async Task<ActionResult<SurgeryPreOpResponseDto>> GetPreOpById(Guid id)
        {
            try
            {
                var result = await _preOpService.GetByIdAsync(id);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPreOpById {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the pre-op record");
            }
        }

        [HttpGet("preop/visit/{visitId}")]
        public async Task<ActionResult<SurgeryPreOpResponseDto>> GetPreOpByVisitId(Guid visitId)
        {
            try
            {
                var result = await _preOpService.GetByVisitIdAsync(visitId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPreOpByVisitId {VisitId}", visitId);
                return StatusCode(500, "An error occurred while retrieving the pre-op record");
            }
        }

        [HttpPost("preop")]
        public async Task<ActionResult<SurgeryPreOpResponseDto>> CreatePreOp([FromBody] CreateSurgeryPreOpRequestDto dto)
        {
            try
            {
                var created = await _preOpService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetPreOpById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreatePreOp");
                return StatusCode(500, "An error occurred while creating the pre-op record");
            }
        }

        [HttpPut("preop/{id}")]
        public async Task<ActionResult<SurgeryPreOpResponseDto>> UpdatePreOp(Guid id, [FromBody] UpdateSurgeryPreOpRequestDto dto)
        {
            try
            {
                if (id != dto.Id) return BadRequest("ID mismatch");
                var updated = await _preOpService.UpdateAsync(dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdatePreOp");
                return StatusCode(500, "An error occurred while updating the pre-op record");
            }
        }

        [HttpDelete("preop/{id}")]
        public async Task<IActionResult> DeletePreOp(Guid id)
        {
            try
            {
                var deleted = await _preOpService.DeleteAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeletePreOp");
                return StatusCode(500, "An error occurred while deleting the pre-op record");
            }
        }

        // --- Surgery Detail Endpoints ---

        [HttpGet("detail/{id}")]
        public async Task<ActionResult<SurgeryDetailResponseDto>> GetDetailById(Guid id)
        {
            try
            {
                var result = await _detailService.GetByIdAsync(id);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDetailById {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the detail record");
            }
        }

        [HttpGet("detail/visit/{visitId}")]
        public async Task<ActionResult<SurgeryDetailResponseDto>> GetDetailByVisitId(Guid visitId)
        {
            try
            {
                var result = await _detailService.GetByVisitIdAsync(visitId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDetailByVisitId {VisitId}", visitId);
                return StatusCode(500, "An error occurred while retrieving the detail record");
            }
        }

        [HttpPost("detail")]
        public async Task<ActionResult<SurgeryDetailResponseDto>> CreateDetail([FromBody] CreateSurgeryDetailRequestDto dto)
        {
            try
            {
                var created = await _detailService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetDetailById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateDetail");
                return StatusCode(500, "An error occurred while creating the detail record");
            }
        }

        [HttpPut("detail/{id}")]
        public async Task<ActionResult<SurgeryDetailResponseDto>> UpdateDetail(Guid id, [FromBody] UpdateSurgeryDetailRequestDto dto)
        {
            try
            {
                if (id != dto.Id) return BadRequest("ID mismatch");
                var updated = await _detailService.UpdateAsync(dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateDetail");
                return StatusCode(500, "An error occurred while updating the detail record");
            }
        }

        [HttpDelete("detail/{id}")]
        public async Task<IActionResult> DeleteDetail(Guid id)
        {
            try
            {
                var deleted = await _detailService.DeleteAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteDetail");
                return StatusCode(500, "An error occurred while deleting the detail record");
            }
        }

        // --- Surgery PostOp Endpoints ---

        [HttpGet("postop/{id}")]
        public async Task<ActionResult<SurgeryPostOpResponseDto>> GetPostOpById(Guid id)
        {
            try
            {
                var result = await _postOpService.GetByIdAsync(id);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPostOpById {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the post-op record");
            }
        }

        [HttpGet("postop/visit/{visitId}")]
        public async Task<ActionResult<SurgeryPostOpResponseDto>> GetPostOpByVisitId(Guid visitId)
        {
            try
            {
                var result = await _postOpService.GetByVisitIdAsync(visitId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPostOpByVisitId {VisitId}", visitId);
                return StatusCode(500, "An error occurred while retrieving the post-op record");
            }
        }

        [HttpPost("postop")]
        public async Task<ActionResult<SurgeryPostOpResponseDto>> CreatePostOp([FromBody] CreateSurgeryPostOpRequestDto dto)
        {
            try
            {
                var created = await _postOpService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetPostOpById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreatePostOp");
                return StatusCode(500, "An error occurred while creating the post-op record");
            }
        }

        [HttpPut("postop/{id}")]
        public async Task<ActionResult<SurgeryPostOpResponseDto>> UpdatePostOp(Guid id, [FromBody] UpdateSurgeryPostOpRequestDto dto)
        {
            try
            {
                if (id != dto.Id) return BadRequest("ID mismatch");
                var updated = await _postOpService.UpdateAsync(dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdatePostOp");
                return StatusCode(500, "An error occurred while updating the post-op record");
            }
        }

        [HttpDelete("postop/{id}")]
        public async Task<IActionResult> DeletePostOp(Guid id)
        {
            try
            {
                var deleted = await _postOpService.DeleteAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeletePostOp");
                return StatusCode(500, "An error occurred while deleting the post-op record");
            }
        }

        // --- Surgery Discharge Endpoints ---

        [HttpGet("discharge/{id}")]
        public async Task<ActionResult<SurgeryDischargeResponseDto>> GetDischargeById(Guid id)
        {
            try
            {
                var result = await _dischargeService.GetByIdAsync(id);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDischargeById {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the discharge record");
            }
        }

        [HttpGet("discharge/visit/{visitId}")]
        public async Task<ActionResult<SurgeryDischargeResponseDto>> GetDischargeByVisitId(Guid visitId)
        {
            try
            {
                var result = await _dischargeService.GetByVisitIdAsync(visitId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDischargeByVisitId {VisitId}", visitId);
                return StatusCode(500, "An error occurred while retrieving the discharge record");
            }
        }

        [HttpPost("discharge")]
        public async Task<ActionResult<SurgeryDischargeResponseDto>> CreateDischarge([FromBody] CreateSurgeryDischargeRequestDto dto)
        {
            try
            {
                var created = await _dischargeService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetDischargeById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateDischarge");
                return StatusCode(500, "An error occurred while creating the discharge record");
            }
        }

        [HttpPut("discharge/{id}")]
        public async Task<ActionResult<SurgeryDischargeResponseDto>> UpdateDischarge(Guid id, [FromBody] UpdateSurgeryDischargeRequestDto dto)
        {
            try
            {
                if (id != dto.Id) return BadRequest("ID mismatch");
                var updated = await _dischargeService.UpdateAsync(dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateDischarge");
                return StatusCode(500, "An error occurred while updating the discharge record");
            }
        }

        [HttpDelete("discharge/{id}")]
        public async Task<IActionResult> DeleteDischarge(Guid id)
        {
            try
            {
                var deleted = await _dischargeService.DeleteAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteDischarge");
                return StatusCode(500, "An error occurred while deleting the discharge record");
            }
        }
    }
} 