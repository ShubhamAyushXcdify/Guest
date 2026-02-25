using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CertificateController : ControllerBase
    {
        private readonly ICertificateService _certificateService;

        public CertificateController(ICertificateService certificateService)
        {
            _certificateService = certificateService;
        }

        /// <summary>
        /// Create certificates for a visit (accepts array of certificates)
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(CertificatesByVisitResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CertificatesByVisitResponseDto>> CreateCertificates([FromBody] CreateCertificateRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Certificate data is null." });
                }

                var result = await _certificateService.CreateCertificatesAsync(dto);
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

        /// <summary>
        /// Get all certificates
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CertificateResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<CertificateResponseDto>>> GetAllCertificates()
        {
            try
            {
                var result = await _certificateService.GetAllCertificatesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        /// <summary>
        /// Get a certificate by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(CertificateResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CertificateResponseDto>> GetCertificate(Guid id)
        {
            try
            {
                var result = await _certificateService.GetCertificateByIdAsync(id);
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

        /// <summary>
        /// Get all certificates for a visit
        /// </summary>
        [HttpGet("visit/{visitId}")]
        [ProducesResponseType(typeof(CertificatesByVisitResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CertificatesByVisitResponseDto>> GetCertificatesByVisit(Guid visitId)
        {
            try
            {
                var result = await _certificateService.GetCertificatesByVisitIdAsync(visitId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        /// <summary>
        /// Update certificates for a visit (works same as POST - adds certificates)
        /// </summary>
        [HttpPut]
        [ProducesResponseType(typeof(CertificatesByVisitResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CertificatesByVisitResponseDto>> UpdateCertificates([FromBody] CreateCertificateRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Certificate data is null." });
                }

                var result = await _certificateService.CreateCertificatesAsync(dto);
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

        /// <summary>
        /// Update an existing certificate by ID
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(CertificateResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CertificateResponseDto>> UpdateCertificate(Guid id, [FromBody] UpdateCertificateItemRequestDto dto)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return BadRequest(new { message = "Certificate ID is required." });
                }

                if (dto == null)
                {
                    return BadRequest(new { message = "Certificate data is null." });
                }

                var result = await _certificateService.UpdateCertificateAsync(id, dto);
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

        /// <summary>
        /// Delete a certificate by ID
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteCertificate(Guid id)
        {
            try
            {
                var result = await _certificateService.DeleteCertificateAsync(id);
                return result ? NoContent() : NotFound(new { message = $"Certificate with id {id} not found." });
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

        /// <summary>
        /// Delete all certificates for a visit
        /// </summary>
        [HttpDelete("visit/{visitId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteCertificatesByVisit(Guid visitId)
        {
            try
            {
                var result = await _certificateService.DeleteCertificatesByVisitIdAsync(visitId);
                return result ? NoContent() : NotFound(new { message = $"No certificates found for visit {visitId}." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }
    }
}