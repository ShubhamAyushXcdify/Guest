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
    public class PlanDetailController : ControllerBase
    {
        private readonly IPlanDetailService _planDetailService;
        private readonly ILogger<PlanDetailController> _logger;

        public PlanDetailController(IPlanDetailService planDetailService, ILogger<PlanDetailController> logger)
        {
            _planDetailService = planDetailService ?? throw new ArgumentNullException(nameof(planDetailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PlanDetailResponseDto>> GetById(Guid id)
        {
            try
            {
                var planDetail = await _planDetailService.GetByIdAsync(id);
                return Ok(planDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Plan detail not found with id {PlanDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for plan detail {PlanDetailId}", id);
                return StatusCode(500, "An error occurred while retrieving the plan detail");
            }
        }

        [HttpGet("visit/{visitId}")]
        public async Task<ActionResult<PlanDetailResponseDto>> GetByVisitId(Guid visitId)
        {
            try
            {
                var planDetail = await _planDetailService.GetByVisitIdAsync(visitId);
                return Ok(planDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Plan detail not found for visit {VisitId}", visitId);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitId for visit {VisitId}", visitId);
                return StatusCode(500, "An error occurred while retrieving the plan detail");
            }
        }

        [HttpPost]
        public async Task<ActionResult<PlanDetailResponseDto>> Create(CreatePlanDetailRequestDto request)
        {
            try
            {
                var planDetail = await _planDetailService.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = planDetail.Id }, planDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, "An error occurred while creating the plan detail");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PlanDetailResponseDto>> Update(Guid id, UpdatePlanDetailRequestDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return BadRequest("Id in route does not match id in request body");
                }

                var planDetail = await _planDetailService.UpdateAsync(dto);
                return Ok(planDetail);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Plan detail not found with id {PlanDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update for plan detail {PlanDetailId}", id);
                return StatusCode(500, "An error occurred while updating the plan detail");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _planDetailService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Plan detail with id {id} not found");
                }
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Plan detail not found with id {PlanDetailId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete for plan detail {PlanDetailId}", id);
                return StatusCode(500, "An error occurred while deleting the plan detail");
            }
        }
    }
} 