using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class SupplierController : ControllerBase
    {
        private readonly ISupplierService _supplierService;

        public SupplierController(ISupplierService supplierService)
        {
            _supplierService = supplierService ?? throw new ArgumentNullException(nameof(supplierService));
        }

        /// <summary>
        /// Gets all suppliers with pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponseDto<SupplierResponseDto>), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<PaginatedResponseDto<SupplierResponseDto>>> GetAll(
            [FromQuery] SupplierFilterDto filter)
        {
            try
            {
                var suppliers = await _supplierService.GetAllAsync(filter);
                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving suppliers", message = ex.Message });
            }
        }

        /// <summary>
        /// Gets a supplier by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(SupplierResponseDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<SupplierResponseDto>> GetById(Guid id)
        {
            try
            {
                var supplier = await _supplierService.GetByIdAsync(id);
                if (supplier == null)
                    return NotFound(new { error = $"Supplier with ID {id} not found" });
                return Ok(supplier);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving the supplier", message = ex.Message });
            }
        }

        /// <summary>
        /// Creates a new supplier
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(SupplierResponseDto), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<SupplierResponseDto>> Create([FromBody] CreateSupplierRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { error = "Request body cannot be null" });

                var created = await _supplierService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while creating the supplier", message = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing supplier
        /// </summary>
        [HttpPut]
        [ProducesResponseType(typeof(SupplierResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<SupplierResponseDto>> Update([FromBody] UpdateSupplierRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { error = "Request body cannot be null" });

                var updated = await _supplierService.UpdateAsync(dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while updating the supplier", message = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a supplier
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var success = await _supplierService.DeleteAsync(id);
                if (!success)
                    return NotFound(new { error = $"Supplier with ID {id} not found" });
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while deleting the supplier", message = ex.Message });
            }
        }
    }
}
