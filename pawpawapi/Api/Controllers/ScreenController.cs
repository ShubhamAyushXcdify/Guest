using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ScreenController : ControllerBase
    {
        private readonly IScreenService _screenService;

        public ScreenController(IScreenService screenService)
        {
            _screenService = screenService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(ScreenResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ScreenResponseDto>> CreateScreen([FromBody] CreateScreenRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Screen data is null." });
                }

                var result = await _screenService.CreateScreenAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ScreenResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ScreenResponseDto>> GetScreenById(Guid id)
        {
            try
            {
                var result = await _screenService.GetScreenByIdAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ScreenResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<ScreenResponseDto>>> GetAllScreens()
        {
            try
            {
                var result = await _screenService.GetAllScreensAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ScreenResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ScreenResponseDto>> UpdateScreen(Guid id, [FromBody] UpdateScreenRequestDto dto)
        {
            try
            {
                if (id != dto.Id)
                {
                    return BadRequest(new { message = "Id in route does not match id in request body." });
                }

                var result = await _screenService.UpdateScreenAsync(id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteScreen(Guid id)
        {
            try
            {
                var result = await _screenService.DeleteScreenAsync(id);
                if (result)
                {
                    return Ok(new { message = "Screen deleted successfully." });
                }
                return NotFound(new { message = "Screen not found." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpGet("access")]
        [ProducesResponseType(typeof(IEnumerable<ScreenAccessResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<ScreenAccessResponseDto>>> GetScreenAccessByClinicId(
            [FromQuery, Required] Guid clinicId,
            [FromQuery] Guid? roleId = null)
        {
            try
            {
                if (clinicId == Guid.Empty)
                {
                    return BadRequest(new { message = "Company ID is required." });
                }

                var result = await _screenService.GetScreenAccessByClinicIdAsync(clinicId, roleId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpPut("access")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> UpdateScreenAccess([FromBody] UpdateScreenAccessRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Screen access data is null." });
                }

                var result = await _screenService.UpdateScreenAccessAsync(dto);
                if (result)
                {
                    return Ok(new { message = "Screen access updated successfully." });
                }
                return BadRequest(new { message = "Failed to update screen access." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }
    }
}
