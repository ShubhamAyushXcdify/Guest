using Application.DTOs;
using Application.Interfaces;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProcedureController : ControllerBase
    {
        private readonly IProcedureService _procedureService;
        private readonly ILogger<ProcedureController> _logger;

        public ProcedureController(IProcedureService procedureService, ILogger<ProcedureController> logger)
        {
            _procedureService = procedureService ?? throw new ArgumentNullException(nameof(procedureService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost]
        public async Task<ActionResult<ProcedureResponseDto>> CreateAsync([FromBody] CreateProcedureRequestDto request)
        {
            try
            {
                var result = await _procedureService.CreateAsync(request);
                return Created($"/api/procedure/{result.Id}", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating procedure");
                return StatusCode(500, "An error occurred while creating the procedure");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProcedureResponseDto>>> GetAllAsync([FromQuery] string? type = null)
        {
            try
            {
                var result = await _procedureService.GetAllAsync(type);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all procedures");
                return StatusCode(500, "An error occurred while getting procedures");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProcedureResponseDto>> GetByIdAsync(Guid id)
        {
            try
            {
                var result = await _procedureService.GetByIdAsync(id);
                if (result == null)
                {
                    return NotFound($"Procedure with id {id} not found");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting procedure {ProcedureId}", id);
                return StatusCode(500, $"An error occurred while getting procedure with id {id}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProcedureResponseDto>> UpdateAsync(Guid id, [FromBody] UpdateProcedureRequestDto request)
        {
            try
            {
                if (id != request.Id)
                {
                    return BadRequest("Id in URL does not match id in request body");
                }

                var result = await _procedureService.UpdateAsync(request);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Procedure with id {id} not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating procedure {ProcedureId}", id);
                return StatusCode(500, $"An error occurred while updating procedure with id {id}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAsync(Guid id)
        {
            try
            {
                var result = await _procedureService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Procedure with id {id} not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting procedure {ProcedureId}", id);
                return StatusCode(500, $"An error occurred while deleting procedure with id {id}");
            }
        }
    }
} 