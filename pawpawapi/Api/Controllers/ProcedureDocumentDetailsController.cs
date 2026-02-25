using System;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Api.Controllers
{
    /// <summary>
    /// Controller for managing procedure document details (JSON data) for specific visit and procedure combinations
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProcedureDocumentDetailsController : ControllerBase
    {
        private readonly IProcedureDocumentDetailsService _procedureDocumentDetailsService;
        private readonly ILogger<ProcedureDocumentDetailsController> _logger;

        public ProcedureDocumentDetailsController(IProcedureDocumentDetailsService procedureDocumentDetailsService, ILogger<ProcedureDocumentDetailsController> logger)
        {
            _procedureDocumentDetailsService = procedureDocumentDetailsService ?? throw new ArgumentNullException(nameof(procedureDocumentDetailsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get procedure document details for a specific visit and procedure
        /// </summary>
        /// <param name="visitId">The visit ID</param>
        /// <param name="procedureId">The procedure ID</param>
        /// <returns>Procedure document details</returns>
        [HttpGet("visit/{visitId}/procedure/{procedureId}")]
        public async Task<ActionResult<ProcedureDocumentDetailsResponseDto>> GetByVisitAndProcedure(Guid visitId, Guid procedureId)
        {
            try
            {
                var documentDetails = await _procedureDocumentDetailsService.GetByVisitAndProcedureAsync(visitId, procedureId);
                return Ok(documentDetails);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Procedure document details not found for visit {VisitId} and procedure {ProcedureId}", visitId, procedureId);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByVisitAndProcedure for visit {VisitId} and procedure {ProcedureId}", visitId, procedureId);
                return StatusCode(500, "An error occurred while retrieving the procedure document details");
            }
        }

        /// <summary>
        /// Create new procedure document details for a visit and procedure
        /// </summary>
        /// <param name="dto">The create request DTO</param>
        /// <returns>Created procedure document details</returns>
        [HttpPost]
        public async Task<ActionResult<ProcedureDocumentDetailsResponseDto>> Create(CreateProcedureDocumentDetailsRequestDto dto)
        {
            try
            {
                var documentDetails = await _procedureDocumentDetailsService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetByVisitAndProcedure), new { visitId = dto.VisitId, procedureId = dto.ProcedureId }, documentDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                return StatusCode(500, "An error occurred while creating the procedure document details");
            }
        }

        /// <summary>
        /// Update existing procedure document details
        /// </summary>
        /// <param name="id">The mapping ID</param>
        /// <param name="dto">The update request DTO</param>
        /// <returns>Updated procedure document details</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ProcedureDocumentDetailsResponseDto>> Update(Guid id, UpdateProcedureDocumentDetailsRequestDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return BadRequest("Id in route does not match id in request body");
                }

                var documentDetails = await _procedureDocumentDetailsService.UpdateAsync(dto);
                return Ok(documentDetails);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Procedure document details not found with id {DocumentDetailsId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update for procedure document details {DocumentDetailsId}", id);
                return StatusCode(500, "An error occurred while updating the procedure document details");
            }
        }

        /// <summary>
        /// Delete procedure document details
        /// </summary>
        /// <param name="id">The mapping ID</param>
        /// <returns>No content on success</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _procedureDocumentDetailsService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Procedure document details with id {id} not found");
                }
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Procedure document details not found with id {DocumentDetailsId}", id);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete for procedure document details {DocumentDetailsId}", id);
                return StatusCode(500, "An error occurred while deleting the procedure document details");
            }
        }
    }
} 