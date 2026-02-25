using System;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic; 
using System.Collections; 

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DischargeSummaryController : ControllerBase
    {
        private readonly IDischargeSummaryService _dischargeSummaryService;
        private readonly ILogger<DischargeSummaryController> _logger;

        public DischargeSummaryController(
            IDischargeSummaryService dischargeSummaryService,
            ILogger<DischargeSummaryController> logger)
        {
            _dischargeSummaryService = dischargeSummaryService ?? throw new ArgumentNullException(nameof(dischargeSummaryService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get complete discharge summary for a consultation visit
        /// </summary>
        /// <param name="visitId">The ID of the visit</param>
        /// <returns>Complete discharge summary including all visit details</returns>
        [HttpGet("consultation/{visitId}")]
        public async Task<ActionResult<DischargeSummaryResponseDto>> GetConsultationSummary(Guid visitId)
        {
            try
            {
                var dischargeSummary = await _dischargeSummaryService.GetDischargeSummaryByVisitIdAsync(visitId);
                return Ok(dischargeSummary);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Visit not found with id {VisitId}", visitId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetConsultationSummary for visit {VisitId}", visitId);
                return StatusCode(500, new { message = "An error occurred while retrieving the discharge summary" });
            }
        }

        /// <summary>
        /// Get complete discharge summary for an emergency visit
        /// </summary>
        /// <param name="visitId">The ID of the visit</param>
        /// <returns>Complete emergency discharge summary including all visit details</returns>
        [HttpGet("emergency/{visitId}")]
        public async Task<ActionResult<EmergencyDischargeSummaryResponseDto>> GetEmergencySummary(Guid visitId)
        {
            try
            {
                var summary = await _dischargeSummaryService.GetEmergencyDischargeSummaryByVisitIdAsync(visitId);
                return Ok(summary);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Emergency visit not found with id {VisitId}", visitId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetEmergencySummary for visit {VisitId}", visitId);
                return StatusCode(500, new { message = "An error occurred while retrieving the emergency discharge summary" });
            }
        }

        /// <summary>
        /// Get complete discharge summary for a surgery visit
        /// </summary>
        /// <param name="visitId">The ID of the visit</param>
        /// <returns>Complete surgery discharge summary including all visit details</returns>
        [HttpGet("surgery/{visitId}")]
        public async Task<ActionResult<SurgeryDischargeSummaryResponseDto>> GetSurgerySummary(Guid visitId)
        {
            try
            {
                var summary = await _dischargeSummaryService.GetSurgeryDischargeSummaryByVisitIdAsync(visitId);
                return Ok(summary);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Surgery visit not found with id {VisitId}", visitId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetSurgerySummary for visit {VisitId}", visitId);
                return StatusCode(500, new { message = "An error occurred while retrieving the surgery discharge summary" });
            }
        }

        /// <summary>
        /// Get complete discharge summary for a deworming visit
        /// </summary>
        /// <param name="visitId">The ID of the visit</param>
        /// <returns>Complete deworming discharge summary including all visit details</returns>
        [HttpGet("deworming/{visitId}")]
        public async Task<ActionResult<DewormingDischargeSummaryResponseDto>> GetDewormingSummary(Guid visitId)
        {
            try
            {
                var summary = await _dischargeSummaryService.GetDewormingDischargeSummaryByVisitIdAsync(visitId);
                return Ok(summary);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Deworming visit not found with id {VisitId}", visitId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDewormingSummary for visit {VisitId}", visitId);
                return StatusCode(500, new { message = "An error occurred while retrieving the deworming discharge summary" });
            }
        }

        /// <summary>
        /// Get complete discharge summary for a vaccination visit
        /// </summary>
        /// <param name="visitId">The ID of the visit</param>
        /// <returns>Complete vaccination discharge summary including all visit details</returns>
        [HttpGet("vaccination/{visitId}")]
        public async Task<ActionResult<VaccinationDischargeSummaryResponseDto>> GetVaccinationSummary(Guid visitId)
        {
            try
            {
                var summary = await _dischargeSummaryService.GetVaccinationDischargeSummaryByVisitIdAsync(visitId);
                return Ok(summary);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Vaccination visit not found with id {VisitId}", visitId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetVaccinationSummary for visit {VisitId}", visitId);
                return StatusCode(500, new { message = "An error occurred while retrieving the vaccination discharge summary" });
            }
        }

        /// <summary>
        /// Get all discharge summaries for a client
        /// </summary>
        /// <param name="clientId">The ID of the client</param>
        /// <param name="fromDate">Start date for filtering appointments (optional)</param>
        /// <param name="toDate">End date for filtering appointments (optional)</param>
        /// <returns>All completed discharge summaries for the client within the date range, ordered by most recent first</returns>
        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<List<ClientDischargeSummaryResponseDto>>> GetClientSummaries(
            Guid clientId, 
            [FromQuery] DateTime? fromDate = null, 
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var summaries = await _dischargeSummaryService.GetClientDischargeSummariesAsync(clientId, fromDate, toDate);
                return Ok(summaries);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Client not found with id {ClientId}", clientId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetClientSummaries for client {ClientId}", clientId);
                return StatusCode(500, new { message = "An error occurred while retrieving the client discharge summaries" });
            }
        }
    }
} 