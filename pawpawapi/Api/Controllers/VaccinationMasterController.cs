using System;
using System.Collections.Generic;
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
    public class VaccinationMasterController : ControllerBase
    {
        private readonly IVaccinationMasterService _service;
        private readonly ILogger<VaccinationMasterController> _logger;

        public VaccinationMasterController(IVaccinationMasterService service, ILogger<VaccinationMasterController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VaccinationMasterResponseDto>>> GetAll([FromQuery] string? species = null, [FromQuery] bool? isCore = null)
        {
            try
            {
                var items = await _service.GetAllAsync(species, isCore);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAll");
                return StatusCode(500, "An error occurred while retrieving vaccination masters");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VaccinationMasterResponseDto>> GetById(Guid id)
        {
            try
            {
                var item = await _service.GetByIdAsync(id);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for vaccination master {VaccinationMasterId}", id);
                return StatusCode(500, "An error occurred while retrieving the vaccination master");
            }
        }

        [HttpPost]
        public async Task<ActionResult<VaccinationMasterResponseDto>> Create([FromBody] CreateVaccinationMasterRequestDto dto)
        {
            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, "An error occurred while creating the vaccination master");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<VaccinationMasterResponseDto>> Update(Guid id, [FromBody] UpdateVaccinationMasterRequestDto dto)
        {
            try
            {
                if (id != dto.Id) return BadRequest("Id mismatch");
                var updated = await _service.UpdateAsync(dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update for vaccination master {VaccinationMasterId}", id);
                return StatusCode(500, "An error occurred while updating the vaccination master");
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
                _logger.LogError(ex, "Error in Delete for vaccination master {VaccinationMasterId}", id);
                return StatusCode(500, "An error occurred while deleting the vaccination master");
            }
        }
    }
} 