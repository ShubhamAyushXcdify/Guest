using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("company-admin")]
        public async Task<ActionResult<DashboardSummaryDto>> GetCompanyAdminSummary(
            [FromQuery, Required] Guid companyId,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            if (companyId == Guid.Empty)
                return BadRequest("Company ID is required.");

            if (fromDate.HasValue && toDate.HasValue && fromDate.Value > toDate.Value)
                return BadRequest("From date must be less than or equal to to date.");

            var summary = await _dashboardService.GetDashboardSummaryAsync(fromDate, toDate, companyId);
            return Ok(summary);
        }

        [HttpGet("super-admin")]
        public async Task<ActionResult<SuperAdminDashboardDto>> GetSuperAdminDashboard(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var summary = await _dashboardService.GetSuperAdminDashboardAsync(fromDate, toDate);
            return Ok(summary);
        }

        [HttpGet("clinic-admin")]
        public async Task<ActionResult<ClinicAdminDashboardDto>> GetClinicAdminDashboard(
            [FromQuery] Guid clinicId,
            [FromQuery] DateTime? fromDate = null, 
            [FromQuery] DateTime? toDate = null)
        {
            if (clinicId == Guid.Empty)
                return BadRequest("Clinic ID is required.");

            var dashboard = await _dashboardService.GetClinicAdminDashboardAsync(clinicId, fromDate, toDate);
            return Ok(dashboard);
        }

        [HttpGet("veterinarian")]
        public async Task<ActionResult<VeterinarianDashboardDto>> GetVeterinarianDashboard(
            [FromQuery] Guid userId,
            [FromQuery] DateTime? fromDate = null, 
            [FromQuery] DateTime? toDate = null)
        {
            if (userId == Guid.Empty)
                return BadRequest("User ID is required.");

            var dashboard = await _dashboardService.GetVeterinarianDashboardAsync(userId, fromDate, toDate);
            return Ok(dashboard);
        }

        [HttpGet("receptionist")]
        public async Task<ActionResult<ReceptionistDashboardDto>> GetReceptionistDashboard(
            [FromQuery] Guid userId,
            [FromQuery] DateTime? fromDate = null, 
            [FromQuery] DateTime? toDate = null)
        {
            if (userId == Guid.Empty)
                return BadRequest("User ID is required.");

            var dashboard = await _dashboardService.GetReceptionistDashboardAsync(userId, fromDate, toDate);
            return Ok(dashboard);
        }

        /// <summary>
        /// Get products expiring within the next 3 months
        /// </summary>
        [HttpGet("expiring-products")]
        public async Task<ActionResult<IEnumerable<ExpiringProductsResponseDto>>> GetExpiringProducts(
            [FromQuery] Guid? clinicId = null)
        {
            var products = await _dashboardService.GetProductsExpiringWithin3MonthsAsync(clinicId);
            return Ok(products);
        }

        /// <summary>
        /// Get weekly profit data for a clinic
        /// Returns serviceProfit and productProfit for every week of the month
        /// Default: Last 6 months from current month
        /// Optional: Filter by fromDate and toDate
        /// </summary>
        [HttpGet("clinic-weekly-profit")]
        public async Task<ActionResult<ClinicWeeklyProfitResponseDto>> GetClinicWeeklyProfit(
            [FromQuery, Required] Guid clinicId,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            if (clinicId == Guid.Empty)
            {
                return BadRequest(new { message = "Clinic ID is required." });
            }

            if (fromDate.HasValue && toDate.HasValue && fromDate.Value > toDate.Value)
            {
                return BadRequest(new { message = "From date must be less than or equal to to date." });
            }

            try
            {
                var result = await _dashboardService.GetClinicWeeklyProfitAsync(clinicId, fromDate, toDate);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving weekly profit data.", details = ex.Message });
            }
        }
    }
} 