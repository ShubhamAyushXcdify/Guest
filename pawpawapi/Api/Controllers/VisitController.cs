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
    public class VisitController : ControllerBase
    {
        private readonly IVisitService _visitService;
        private readonly ILogger<VisitController> _logger;

        public VisitController(IVisitService visitService, ILogger<VisitController> logger)
        {
            _visitService = visitService ?? throw new ArgumentNullException(nameof(visitService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<VisitResponseDto>>> GetAll(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool paginationRequired = true)
        {
            try
            {
                if (pageNumber < 1)
                {
                    return BadRequest("Page number must be greater than 0");
                }

                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest("Page size must be between 1 and 100");
                }

                var visits = await _visitService.GetAllAsync(
                    pageNumber,
                    pageSize,
                    paginationRequired);

                return Ok(visits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAll");
                return StatusCode(500, "An error occurred while retrieving visits");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VisitResponseDto>> GetById(Guid id)
        {
            try
            {
                var visit = await _visitService.GetByIdAsync(id);
                if (visit == null) return NotFound();
                return Ok(visit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById for visit {VisitId}", id);
                return StatusCode(500, "An error occurred while retrieving the visit");
            }
        }

        [HttpPost]
        public async Task<ActionResult<VisitResponseDto>> Create([FromBody] CreateVisitRequestDto dto)
        {
            try
            {
                var created = await _visitService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, "An error occurred while creating the visit");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<VisitResponseDto>> Update(Guid id, [FromBody] UpdateVisitRequestDto dto)
        {
            try
            {
                var updated = await _visitService.UpdateAsync(id, dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update");
                return StatusCode(500, "An error occurred while updating the visit");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _visitService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete for visit {VisitId}", id);
                return StatusCode(500, "An error occurred while deleting the visit");
            }
        }

        [HttpGet("appointment/{appointmentId}")]
        public async Task<ActionResult<VisitResponseDto>> GetByAppointmentId(Guid appointmentId)
        {
            try
            {
                var visit = await _visitService.GetByAppointmentIdAsync(appointmentId);
                if (visit == null) return NotFound();
                return Ok(visit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByAppointmentId for appointment {AppointmentId}", appointmentId);
                return StatusCode(500, "An error occurred while retrieving the visit");
            }
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<VisitResponseDto>> GetByPatientId(Guid patientId)
        {
            try
            {
                var visit = await _visitService.GetByPatientIdAsync(patientId);
                if (visit == null) return NotFound();
                return Ok(visit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByPatientId for patient {PatientId}", patientId);
                return StatusCode(500, "An error occurred while retrieving the visit");
            }
        }
    }
} 