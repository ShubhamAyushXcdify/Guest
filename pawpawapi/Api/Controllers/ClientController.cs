using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ClientController : ControllerBase
    {
        private readonly IClientService _clientService;

        public ClientController(IClientService clientService)
        {
            _clientService = clientService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponseDto<ClientResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PaginatedResponseDto<ClientResponseDto>>> GetAllClients(
            [FromQuery] ClientFilterDto filter)
        {
            try
            {
                if (filter.PageNumber < 1)
                {
                    return BadRequest(new { message = "Page number must be greater than 0." });
                }

                if (filter.PageSize < 1 || filter.PageSize > 100)
                {
                    return BadRequest(new { message = "Page size must be between 1 and 100." });
                }

                var result = await _clientService.GetAllAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ClientResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ClientResponseDto>> GetClient(Guid id)
        {
            try
            {
                var result = await _clientService.GetByIdAsync(id);
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

        [HttpPost]
        [ProducesResponseType(typeof(ClientResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ClientResponseDto>> CreateClient([FromBody] CreateClientRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Client data is null." });
                }

                var result = await _clientService.CreateAsync(dto);
                return Ok(result);
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
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ClientResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ClientResponseDto>> UpdateClient(Guid id, [FromBody] UpdateClientRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Client data is null." });
                }

                if (id != dto.Id)
                {
                    return BadRequest(new { message = "Id in route does not match id in request body." });
                }

                var result = await _clientService.UpdateAsync(dto);
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
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteClient(Guid id)
        {
            try
            {
                var result = await _clientService.DeleteAsync(id);
                return result ? NoContent() : NotFound(new { message = $"Client with id {id} not found." });
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

        [HttpPost("request-delete-otp")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> RequestDeleteOtp([FromBody] RequestClientDeleteOtpDto dto)
        {
            try
            {
                if (dto == null || dto.ClientId == Guid.Empty)
                {
                    return BadRequest(new { message = "Client ID is required." });
                }

                await _clientService.RequestDeleteOtpAsync(dto.ClientId);
                return Ok(new { message = "OTP has been sent to the client's registered email and phone number." });
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

        [HttpPost("verify-delete-otp")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> VerifyDeleteOtp([FromBody] VerifyClientDeleteOtpDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Request data is required." });
                }

                if (dto.ClientId == Guid.Empty)
                {
                    return BadRequest(new { message = "Client ID is required." });
                }

                if (string.IsNullOrWhiteSpace(dto.Otp))
                {
                    return BadRequest(new { message = "OTP is required." });
                }

                var deleted = await _clientService.VerifyAndDeleteClientAsync(dto.ClientId, dto.Otp);
                if (deleted)
                {
                    return Ok(new { message = "Client account has been deleted successfully." });
                }
                else
                {
                    return NotFound(new { message = $"Client with id {dto.ClientId} not found." });
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
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
    }
}
