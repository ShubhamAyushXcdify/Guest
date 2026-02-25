using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Application.DTOs;
using Application.Interfaces;
using Api.Services;

namespace Api.Controllers
{
    [Route("api/company")]
    [ApiController]
    public class CompaniesController : ControllerBase
    {
        private readonly ICompanyService _companyService;
        private readonly IFileUploadService _fileUploadService;

        public CompaniesController(ICompanyService companyService, IFileUploadService fileUploadService)
        {
            _companyService = companyService;
            _fileUploadService = fileUploadService;
        }

        /// <summary>
        /// Create a company (JSON body only). Use POST with multipart/form-data for file upload.
        /// </summary>
        [HttpPost]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CompanyDto>> CreateCompany([FromBody] CreateCompanyDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Company data is null.");
                var result = await _companyService.CreateCompanyAsync(dto);
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
        /// Create a company with optional file upload (multipart/form-data). File is stored under FileUpload:UploadPath in a folder named "uploads"; path is saved in LogoUrl.
        /// </summary>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CompanyDto>> CreateCompanyWithFile([FromForm] CreateCompanyDto dto, [FromForm] string? address, IFormFile? file)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Company data is null.");
                if (!string.IsNullOrWhiteSpace(address))
                {
                    try
                    {
                        dto.Address = JsonSerializer.Deserialize<AddressDto>(address, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    }
                    catch { /* leave null if invalid JSON */ }
                }
                if (file != null)
                {
                    var storedPath = await _fileUploadService.SaveFileAsync(file);
                    if (!string.IsNullOrEmpty(storedPath))
                        dto.LogoUrl = storedPath;
                }
                var result = await _companyService.CreateCompanyAsync(dto);
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
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CompanyDto>> GetCompany(Guid id)
        {
            try
            {
                var result = await _companyService.GetCompanyByIdAsync(id);
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

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponseDto<CompanyDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PaginatedResponseDto<CompanyDto>>> GetAllCompanies(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool paginationRequired = true,
            [FromQuery] string? domainName = null)
        {
            try
            {
                if (pageNumber < 1)
                {
                    return BadRequest("Page number must be greater than 0");
                }

                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest("Page size must be between 1 and 100");
                }

                var result = await _companyService.GetAllAsync(pageNumber, pageSize, paginationRequired, domainName);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }

        /// <summary>
        /// Update a company (JSON body only). Use PUT with multipart/form-data for file upload.
        /// </summary>
        [HttpPut("{id}")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CompanyDto>> UpdateCompany(Guid id, [FromBody] UpdateCompanyDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Update data is null.");
                var result = await _companyService.UpdateCompanyAsync(id, dto);
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
        /// Update a company with optional file upload (multipart/form-data). File is stored under FileUpload:UploadPath in "uploads"; path is saved in LogoUrl.
        /// </summary>
        [HttpPut("{id}/upload")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CompanyDto>> UpdateCompanyWithFile(Guid id, [FromForm] UpdateCompanyDto dto, [FromForm] string? address, IFormFile? file)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Update data is null.");
                if (!string.IsNullOrWhiteSpace(address))
                {
                    try
                    {
                        dto.Address = JsonSerializer.Deserialize<AddressDto>(address, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    }
                    catch { /* leave null if invalid JSON */ }
                }
                if (file != null)
                {
                    var storedPath = await _fileUploadService.SaveFileAsync(file);
                    if (!string.IsNullOrEmpty(storedPath))
                        dto.LogoUrl = storedPath;
                }
                var result = await _companyService.UpdateCompanyAsync(id, dto);
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

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteCompany(Guid id)
        {
            try
            {
                var result = await _companyService.DeleteCompanyAsync(id);
                return result ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { statusCode = 500, message = ex.Message });
            }
        }
    }
}
