using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VisitInvoiceController : ControllerBase
    {
        private readonly IVisitInvoiceService _service;
        private readonly ILogger<VisitInvoiceController> _logger;

        public VisitInvoiceController(IVisitInvoiceService service, ILogger<VisitInvoiceController> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<VisitInvoiceResponseDto>>> GetAllAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] Guid? visitId = null, [FromQuery] Guid? clinicId = null)
        {
            var result = await _service.GetAllAsync(pageNumber, pageSize, visitId, clinicId);
            return Ok(result);
        }

        [HttpGet("filter")]
        public async Task<ActionResult<PaginatedResponseDto<VisitInvoiceResponseDto>>> GetByFiltersAsync(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] Guid? patientId = null,
            [FromQuery] string? status = null,
            [FromQuery] string? paymentMethod = null,
            [FromQuery] DateTimeOffset? createdAtFrom = null,
            [FromQuery] DateTimeOffset? createdAtTo = null,
            [FromQuery] Guid? clinicId = null)
        {
            var result = await _service.GetByFiltersAsync(pageNumber, pageSize, patientId, status, paymentMethod, createdAtFrom, createdAtTo, clinicId);
            return Ok(result);
        }

        [HttpGet("visit/{visitId}")]
        public async Task<ActionResult<VisitInvoiceResponseDto?>> GetByVisitIdAsync([FromRoute] Guid visitId, [FromQuery] Guid? clinicId = null)
        {
            var result = await _service.GetByVisitIdAsync(visitId, clinicId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VisitInvoiceResponseDto?>> GetByIdAsync([FromRoute] Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<VisitInvoiceResponseDto>> CreateAsync([FromBody] CreateVisitInvoiceRequestDto request)
        {
            var result = await _service.CreateAsync(request);
            return Created($"/api/visitinvoice/{result.Id}", result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<VisitInvoiceResponseDto>> UpdateAsync([FromRoute] Guid id, [FromBody] UpdateVisitInvoiceRequestDto request)
        {
            var result = await _service.UpdateAsync(id, request);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAsync([FromRoute] Guid id)
        {
            var ok = await _service.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
