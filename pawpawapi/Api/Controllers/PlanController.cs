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
    public class PlanController : ControllerBase
    {
        private readonly IPlanService _planService;
        private readonly ILogger<PlanController> _logger;

        public PlanController(IPlanService planService, ILogger<PlanController> logger)
        {
            _planService = planService ?? throw new ArgumentNullException(nameof(planService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost]
        public async Task<ActionResult<PlanResponseDto>> CreateAsync([FromBody] CreatePlanRequestDto request)
        {
            try
            {
                var result = await _planService.CreateAsync(request);
                return Created($"/api/plan/{result.Id}", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating plan");
                return StatusCode(500, "An error occurred while creating the plan");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlanResponseDto>>> GetAllAsync()
        {
            try
            {
                var result = await _planService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all plans");
                return StatusCode(500, "An error occurred while getting plans");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PlanResponseDto>> GetByIdAsync(Guid id)
        {
            try
            {
                var result = await _planService.GetByIdAsync(id);
                if (result == null)
                {
                    return NotFound($"Plan with id {id} not found");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting plan {PlanId}", id);
                return StatusCode(500, $"An error occurred while getting plan with id {id}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PlanResponseDto>> UpdateAsync(Guid id, [FromBody] UpdatePlanRequestDto request)
        {
            try
            {
                if (id != request.Id)
                {
                    return BadRequest("Id in URL does not match id in request body");
                }

                var result = await _planService.UpdateAsync(request);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Plan with id {id} not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating plan {PlanId}", id);
                return StatusCode(500, $"An error occurred while updating plan with id {id}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAsync(Guid id)
        {
            try
            {
                var result = await _planService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Plan with id {id} not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting plan {PlanId}", id);
                return StatusCode(500, $"An error occurred while deleting plan with id {id}");
            }
        }
    }
} 