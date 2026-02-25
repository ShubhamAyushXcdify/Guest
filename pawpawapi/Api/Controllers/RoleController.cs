using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Core.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _service;

        public RoleController(IRoleService service)
        {
            _service = service;
        }

        [HttpPost]
        [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.CreateAsync(dto);
            if (result.IsSuccess)
                return Ok(result.Value);
            if (result.Error?.Type == ErrorType.Validation)
                return BadRequest(result);
            return StatusCode(500, result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRole(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result.IsSuccess)
                return Ok(result.Value);
            if (result.Error?.Type == ErrorType.NotFound)
                return NotFound(result);
            if (result.Error?.Type == ErrorType.Validation)
                return BadRequest(result);
            return StatusCode(500, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<RoleDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllRoles()
        {
            var result = await _service.GetAllAsync();
            if (result.IsSuccess)
                return Ok(result.Value);
            return StatusCode(500, result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errorResult = Result<RoleDto>.Failure(Error.Validation("Invalid model state"));
                return BadRequest(errorResult);
            }

            var result = await _service.UpdateAsync(id, dto);
            if (result.IsSuccess)
                return Ok(result.Value);
            if (result.Error?.Type == ErrorType.NotFound)
                return NotFound(result);
            if (result.Error?.Type == ErrorType.Validation)
                return BadRequest(result);
            return StatusCode(500, result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            if (result.IsSuccess)
                return Ok(result.Value);
            if (result.Error?.Type == ErrorType.NotFound)
                return NotFound(result);
            if (result.Error?.Type == ErrorType.Validation)
                return BadRequest(result);
            return StatusCode(500, result);
        }
    }
}
