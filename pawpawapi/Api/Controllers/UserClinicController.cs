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
    public class UserClinicController : ControllerBase
    {
        private readonly IUserClinicService _userClinicService;

        public UserClinicController(IUserClinicService userClinicService)
        {
            _userClinicService = userClinicService;
        }

        /// <summary>
        /// Gets all user-clinic relationships with pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponseDto<UserClinicResponseDto>), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<PaginatedResponseDto<UserClinicResponseDto>>> GetAll(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] Guid? clinicId = null)
        {
            try
            {
                var userClinics = await _userClinicService.GetAllAsync(pageNumber, pageSize, clinicId);
                return Ok(userClinics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving user-clinic relationships", message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserClinicResponseDto>> GetById(Guid id)
        {
            var item = await _userClinicService.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<UserClinicResponseDto>> Create([FromBody] CreateUserClinicRequestDto dto)
        {
            var created = await _userClinicService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut]
        public async Task<ActionResult<UserClinicResponseDto>> Update([FromBody] UpdateUserClinicRequestDto dto)
        {
            var updated = await _userClinicService.UpdateAsync(dto);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _userClinicService.DeleteAsync(id);
            return NoContent();
        }
    }
} 