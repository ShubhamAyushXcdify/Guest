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
    public class ProcedureDetailController : ControllerBase
    {
        private readonly IProcedureDetailService _procedureDetailService;
        private readonly ILogger<ProcedureDetailController> _logger;

        public ProcedureDetailController(IProcedureDetailService procedureDetailService, ILogger<ProcedureDetailController> logger)
        {
            _procedureDetailService = procedureDetailService ?? throw new ArgumentNullException(nameof(procedureDetailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProcedureDetailResponseDto>> GetById(Guid id)
        {
            try
            {
                var procedureDetail = await _procedureDetailService.GetByIdAsync(id);
                return Ok(procedureDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Procedure detail not found with id {ProcedureDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for procedure detail {ProcedureDetailId}", id);
                return StatusCode(500, "An error occurred while retrieving the procedure detail");
            }
        }

        [HttpGet("visit/{visitId}")]
        public async Task<ActionResult<ProcedureDetailResponseDto>> GetByVisitId(Guid visitId)
        {
            try
            {
                var procedureDetail = await _procedureDetailService.GetByVisitIdAsync(visitId);
                return Ok(procedureDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Procedure detail not found for visit {VisitId}", visitId);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitId for visit {VisitId}", visitId);
                return StatusCode(500, "An error occurred while retrieving the procedure detail");
            }
        }

        [HttpPost]
        public async Task<ActionResult<ProcedureDetailResponseDto>> Create(CreateProcedureDetailRequestDto dto)
        {
            try
            {
                var procedureDetail = await _procedureDetailService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = procedureDetail.Id }, procedureDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, "An error occurred while creating the procedure detail");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProcedureDetailResponseDto>> Update(Guid id, UpdateProcedureDetailRequestDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return BadRequest("Id in route does not match id in request body");
                }

                var procedureDetail = await _procedureDetailService.UpdateAsync(dto);
                return Ok(procedureDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Procedure detail not found with id {ProcedureDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update for procedure detail {ProcedureDetailId}", id);
                return StatusCode(500, "An error occurred while updating the procedure detail");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _procedureDetailService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Procedure detail with id {id} not found");
                }
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Procedure detail not found with id {ProcedureDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete for procedure detail {ProcedureDetailId}", id);
                return StatusCode(500, "An error occurred while deleting the procedure detail");
            }
        }
    }
} 