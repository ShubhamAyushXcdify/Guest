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
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Gets all users with pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponseDto<UserResponseDto>), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<PaginatedResponseDto<UserResponseDto>>> GetAll(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] Guid[]? roleIds = null,
            [FromQuery] Guid[]? clinicIds = null,
            [FromQuery] Guid? companyId = null,
            [FromQuery] bool paginationRequired = true)
        {
            try
            {
                var result = await _userService.GetAllAsync(pageNumber, pageSize, roleIds, clinicIds, paginationRequired, companyId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                return StatusCode(500, "An error occurred while retrieving users");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetById(Guid id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound($"User with ID {id} not found");
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by ID: {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the user");
            }
        }

        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> Create([FromBody] CreateUserRequestDto dto)
        {
            try
            {
                var createdUser = await _userService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, createdUser);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, "An error occurred while creating the user");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponseDto>> Update(Guid id, [FromBody] UpdateUserRequestDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return BadRequest("ID in URL does not match ID in request body");
                }

                var updatedUser = await _userService.UpdateAsync(dto);
                return Ok(updatedUser);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user: {Id}", id);
                return StatusCode(500, "An error occurred while updating the user");
            }
        }

        /// <summary>
        /// Updates the slots of a user
        /// </summary>
        [HttpPut("{id}/slots")]
        public async Task<ActionResult> UpdateUserSlots(Guid id, [FromBody] UserSlotsRequestDto request)
        {
            try
            {
                await _userService.UpdateUserSlotsAsync(id, request.SlotIds, request.ClinicId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user slots: {Id}", id);
                return StatusCode(500, "An error occurred while updating user slots");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _userService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"User with ID {id} not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user: {Id}", id);
                return StatusCode(500, "An error occurred while deleting the user");
            }
        }

        [HttpGet("email/{email}")]
        public async Task<ActionResult<UserResponseDto>> GetByEmail(string email)
        {
            try
            {
                var user = await _userService.GetByEmailAsync(email);
                if (user == null)
                {
                    return NotFound($"User with email {email} not found");
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by email: {Email}", email);
                return StatusCode(500, "An error occurred while retrieving the user");
            }
        }

        [HttpGet("clinic/{clinicId}")]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetByClinicId(Guid clinicId)
        {
            try
            {
                var users = await _userService.GetByClinicIdAsync(clinicId);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users by clinic ID: {ClinicId}", clinicId);
                return StatusCode(500, "An error occurred while retrieving users");
            }
        }
        [HttpGet("{userId}/available-slots")]
        public async Task<ActionResult<IEnumerable<UserSlotDto>>> GetAvailableSlotsForVeterinarian(
            Guid userId,
            [FromQuery] DateTime? date = null,
            [FromQuery] Guid? clinicId = null)
        {
            try
            {
                var slots = await _userService.GetAvailableUserSlotsAsync(userId, date, clinicId);
                return Ok(slots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available slots for veterinarian");
                return StatusCode(500, "An error occurred while retrieving available slots");
            }
        }

        /// <summary>
        /// Gets user slots grouped by clinic
        /// </summary>
        [HttpGet("{userId}/clinics-slots")]
        [ProducesResponseType(typeof(IEnumerable<UserClinicSlotsResponseDto>), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<UserClinicSlotsResponseDto>>> GetUserSlotsByClinic(
            Guid userId,
            [FromQuery] Guid? clinicId = null)
        {
            try
            {
                var result = await _userService.GetUserSlotsByClinicAsync(userId, clinicId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user slots by clinic for user: {UserId}", userId);
                return StatusCode(500, "An error occurred while retrieving user slots by clinic");
            }
        }
    }
} 