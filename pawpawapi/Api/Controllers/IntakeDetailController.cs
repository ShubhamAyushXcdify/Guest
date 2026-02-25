using System;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Linq;
using System.IO;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Api.Controllers
{
    /// <summary>
    /// Controller for managing intake detail operations with enhanced error handling and security
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public class IntakeDetailController : ControllerBase
    {
        private readonly IIntakeDetailService _intakeDetailService;
        private readonly ILogger<IntakeDetailController> _logger;

        public IntakeDetailController(IIntakeDetailService intakeDetailService, ILogger<IntakeDetailController> logger)
        {
            _intakeDetailService = intakeDetailService ?? throw new ArgumentNullException(nameof(intakeDetailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves an intake detail by ID
        /// </summary>
        /// <param name="id">Intake detail ID</param>
        /// <returns>Intake detail response DTO</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IntakeDetailResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IntakeDetailResponseDto>> GetById([Required] Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    _logger.LogWarning("Invalid intake detail ID provided: {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Intake detail ID cannot be empty" });
                }

                var intakeDetail = await _intakeDetailService.GetByIdAsync(id);
                return Ok(intakeDetail);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for intake detail {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Intake detail not found with ID {Id}", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Operation failed for intake detail {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving the intake detail" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving intake detail {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while retrieving the intake detail" });
            }
        }

        /// <summary>
        /// Retrieves an intake detail by visit ID
        /// </summary>
        /// <param name="visitId">Visit ID</param>
        /// <returns>Intake detail response DTO</returns>
        [HttpGet("visit/{visitId}")]
        [ProducesResponseType(typeof(IntakeDetailResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IntakeDetailResponseDto>> GetByVisitId([Required] Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                {
                    _logger.LogWarning("Invalid visit ID provided: {VisitId}", visitId);
                    return BadRequest(new { statusCode = 400, message = "Visit ID cannot be empty" });
                }

                var intakeDetail = await _intakeDetailService.GetByVisitIdAsync(visitId);
                return Ok(intakeDetail);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for visit {VisitId}", visitId);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Intake detail not found for visit {VisitId}", visitId);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving intake detail for visit {VisitId}", visitId);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while retrieving the intake detail" });
            }
        }

        /// <summary>
        /// Creates a new intake detail with file upload support
        /// </summary>
        /// <param name="dto">Create intake detail request DTO</param>
        /// <param name="files">Optional files to upload</param>
        /// <returns>Created intake detail response DTO</returns>
        [HttpPost]
        [RequestSizeLimit(10L * 1024 * 1024 * 1024)] // 10GB limit
        [ProducesResponseType(typeof(IntakeDetailResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IntakeDetailResponseDto>> Create(
            [FromForm] CreateIntakeDetailRequestDto dto,
            [FromForm] ICollection<IFormFile>? files)
        {
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Null intake detail data provided");
                    return BadRequest(new { statusCode = 400, message = "Intake detail data cannot be null" });
                }

                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    _logger.LogWarning("Invalid model state for intake detail creation: {Errors}", string.Join(", ", errors));
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided", errors });
                }

                // Process files and populate the DTO in controller (presentation layer responsibility)
                if (files != null && files.Any())
                {
                    dto.Files = await ProcessFormFilesAsync(files);
                }

                var intakeDetail = await _intakeDetailService.CreateAsync(dto);

                _logger.LogInformation("Intake detail created successfully with ID {Id}", intakeDetail.Id);
                return CreatedAtAction(nameof(GetById), new { id = intakeDetail.Id }, intakeDetail);
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Null argument provided for intake detail creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for intake detail creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during intake detail creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating intake detail");
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while creating the intake detail" });
            }
        }

        /// <summary>
        /// Updates an existing intake detail with file upload support
        /// </summary>
        /// <param name="id">Intake detail ID</param>
        /// <param name="dto">Update intake detail request DTO</param>
        /// <param name="files">Optional files to upload</param>
        /// <returns>Updated intake detail response DTO</returns>
        [HttpPut("{id}")]
        [RequestSizeLimit(10L * 1024 * 1024 * 1024)] // 10GB limit
        [ProducesResponseType(typeof(IntakeDetailResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IntakeDetailResponseDto>> Update(
            [Required] Guid id,
            [FromForm] UpdateIntakeDetailRequestDto dto,
            [FromForm] ICollection<IFormFile>? files)
        {
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Null update data provided for intake detail {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Update data cannot be null" });
                }

                if (id == Guid.Empty)
                {
                    _logger.LogWarning("Invalid intake detail ID provided: {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Intake detail ID cannot be empty" });
                }

                if (id != dto.Id)
                {
                    _logger.LogWarning("Route ID {RouteId} does not match DTO ID {DtoId}", id, dto.Id);
                    return BadRequest(new { statusCode = 400, message = "ID in route does not match ID in request body" });
                }

                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    _logger.LogWarning("Invalid model state for intake detail update: {Errors}", string.Join(", ", errors));
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided", errors });
                }

                // Process files and populate the DTO in controller (presentation layer responsibility)
                if (files != null && files.Any())
                {
                    dto.Files = await ProcessFormFilesAsync(files);
                }

                var intakeDetail = await _intakeDetailService.UpdateAsync(dto);

                _logger.LogInformation("Intake detail {Id} updated successfully", id);
                return Ok(intakeDetail);
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Null argument provided for intake detail update {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for intake detail update {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Intake detail not found for update {Id}", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during intake detail update {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error updating intake detail {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while updating the intake detail" });
            }
        }

        /// <summary>
        /// Deletes an intake detail by ID
        /// </summary>
        /// <param name="id">Intake detail ID</param>
        /// <returns>No content on successful deletion</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> Delete([Required] Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    _logger.LogWarning("Invalid intake detail ID provided for deletion: {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Intake detail ID cannot be empty" });
                }

                var result = await _intakeDetailService.DeleteAsync(id);

                _logger.LogInformation("Intake detail {Id} deleted successfully", id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for intake detail deletion {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Intake detail not found for deletion {Id}", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Operation failed during intake detail deletion {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while deleting the intake detail" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error deleting intake detail {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while deleting the intake detail" });
            }
        }

        /// <summary>
        /// Deletes a specific file from an intake detail
        /// </summary>
        /// <param name="fileId">File ID</param>
        /// <returns>Delete file response DTO</returns>
        [HttpDelete("file/{fileId}")]
        [ProducesResponseType(typeof(DeleteFileResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeleteFileResponseDto>> DeleteFile([Required] Guid fileId)
        {
            try
            {
                if (fileId == Guid.Empty)
                {
                    _logger.LogWarning("Invalid file ID provided for deletion: {FileId}", fileId);
                    return BadRequest(new DeleteFileResponseDto
                    {
                        Success = false,
                        Message = "File ID cannot be empty"
                    });
                }

                var result = await _intakeDetailService.DeleteFileAsync(fileId);

                if (!result.Success)
                {
                    return NotFound(result);
                }

                _logger.LogInformation("File {FileId} deleted successfully", fileId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for file deletion {FileId}", fileId);
                return BadRequest(new DeleteFileResponseDto
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error deleting file {FileId}", fileId);
                return StatusCode(500, new DeleteFileResponseDto
                {
                    Success = false,
                    Message = "An unexpected error occurred while deleting the file"
                });
            }
        }

        #region Private Helper Methods

        /// <summary>
        /// Processes form files and converts them to DTOs for service layer
        /// </summary>
        /// <param name="files">Form files collection</param>
        /// <returns>Collection of create intake file request DTOs</returns>
        private async Task<ICollection<CreateIntakeFileRequestDto>> ProcessFormFilesAsync(ICollection<IFormFile> files)
        {
            var processedFiles = new List<CreateIntakeFileRequestDto>();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    try
                    {
                        var fileData = await GetFileBytesAsync(file);
                        processedFiles.Add(new CreateIntakeFileRequestDto
                        {
                            FileName = file.FileName,
                            FileData = fileData,
                            FileType = Path.GetExtension(file.FileName).ToLowerInvariant(),
                            FileSize = file.Length
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to process file {FileName}", file.FileName);
                        throw new InvalidOperationException($"Failed to process file '{file.FileName}': {ex.Message}", ex);
                    }
                }
            }

            return processedFiles;
        }

        /// <summary>
        /// Converts IFormFile to byte array asynchronously for better performance
        /// </summary>
        /// <param name="file">Form file</param>
        /// <returns>File bytes</returns>
        private static async Task<byte[]> GetFileBytesAsync(IFormFile file)
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            return memoryStream.ToArray();
        }

        #endregion
    }
}