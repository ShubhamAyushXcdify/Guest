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
    /// Controller for managing patient file operations with enhanced error handling and security
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/patient")]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public class PatientFileController : ControllerBase
    {
        private readonly IPatientFileService _patientFileService;
        private readonly ILogger<PatientFileController> _logger;

        public PatientFileController(IPatientFileService patientFileService, ILogger<PatientFileController> logger)
        {
            _patientFileService = patientFileService ?? throw new ArgumentNullException(nameof(patientFileService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves a patient file by ID
        /// </summary>
        /// <param name="id">Patient file ID</param>
        /// <returns>Patient file response DTO</returns>
        [HttpGet("files/{id}")]
        [ProducesResponseType(typeof(PatientFileResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PatientFileResponseDto>> GetById([Required] Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    _logger.LogWarning("Invalid patient file ID provided: {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Patient file ID cannot be empty" });
                }

                var patientFile = await _patientFileService.GetByIdAsync(id);
                return Ok(patientFile);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient file {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Patient file not found with ID {Id}", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Operation failed for patient file {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while retrieving the patient file" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving patient file {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while retrieving the patient file" });
            }
        }

        /// <summary>
        /// Retrieves all patient files for a specific patient
        /// </summary>
        /// <param name="patientId">Patient ID</param>
        /// <returns>Collection of patient file response DTOs</returns>
        [HttpGet("files/patient/{patientId}")]
        [ProducesResponseType(typeof(IEnumerable<PatientFileResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<PatientFileResponseDto>>> GetByPatientId([Required] Guid patientId)
        {
            try
            {
                if (patientId == Guid.Empty)
                {
                    _logger.LogWarning("Invalid patient ID provided: {PatientId}", patientId);
                    return BadRequest(new { statusCode = 400, message = "Patient ID cannot be empty" });
                }

                var patientFiles = await _patientFileService.GetByPatientIdAsync(patientId);
                return Ok(patientFiles);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient {PatientId}", patientId);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving patient files for patient {PatientId}", patientId);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while retrieving the patient files" });
            }
        }

        /// <summary>
        /// Creates a new patient file with file upload support
        /// </summary>
        /// <param name="dto">Create patient file request DTO</param>
        /// <param name="files">Optional files to upload</param>
        /// <returns>Created patient file response DTO</returns>
        [HttpPost("files")]
        [RequestSizeLimit(10L * 1024 * 1024 * 1024)] // 10GB limit
        [ProducesResponseType(typeof(PatientFileResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PatientFileResponseDto>> Create(
            [FromForm] CreatePatientFileRequestDto dto,
            [FromForm] ICollection<IFormFile>? files)
        {
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Null patient file data provided");
                    return BadRequest(new { statusCode = 400, message = "Patient file data cannot be null" });
                }

                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    _logger.LogWarning("Invalid model state for patient file creation: {Errors}", string.Join(", ", errors));
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided", errors });
                }

                // Process files and populate the DTO in controller (presentation layer responsibility)
                if (files != null && files.Any())
                {
                    dto.Files = await ProcessFormFilesAsync(files);
                }

                var patientFile = await _patientFileService.CreateAsync(dto);

                _logger.LogInformation("Patient file created successfully with ID {Id}", patientFile.Id);
                return CreatedAtAction(nameof(GetById), new { id = patientFile.Id }, patientFile);
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Null argument provided for patient file creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient file creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during patient file creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating patient file");
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while creating the patient file" });
            }
        }

        /// <summary>
        /// Updates an existing patient file with file upload support
        /// </summary>
        /// <param name="id">Patient file ID</param>
        /// <param name="dto">Update patient file request DTO</param>
        /// <param name="files">Optional files to upload</param>
        /// <returns>Updated patient file response DTO</returns>
        [HttpPut("files/{id}")]
        [RequestSizeLimit(10L * 1024 * 1024 * 1024)] // 10GB limit
        [ProducesResponseType(typeof(PatientFileResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PatientFileResponseDto>> Update(
            [Required] Guid id,
            [FromForm] UpdatePatientFileRequestDto dto,
            [FromForm] ICollection<IFormFile>? files)
        {
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Null update data provided for patient file {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Update data cannot be null" });
                }

                if (id == Guid.Empty)
                {
                    _logger.LogWarning("Invalid patient file ID provided: {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Patient file ID cannot be empty" });
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
                    _logger.LogWarning("Invalid model state for patient file update: {Errors}", string.Join(", ", errors));
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided", errors });
                }

                // Process files and populate the DTO in controller (presentation layer responsibility)
                if (files != null && files.Any())
                {
                    dto.Files = await ProcessFormFilesAsync(files);
                }

                var patientFile = await _patientFileService.UpdateAsync(dto);

                _logger.LogInformation("Patient file {Id} updated successfully", id);
                return Ok(patientFile);
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Null argument provided for patient file update {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient file update {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Patient file not found for update {Id}", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during patient file update {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error updating patient file {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while updating the patient file" });
            }
        }

        /// <summary>
        /// Deletes a patient file by ID
        /// </summary>
        /// <param name="id">Patient file ID</param>
        /// <returns>No content on successful deletion</returns>
        [HttpDelete("files/{id}")]
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
                    _logger.LogWarning("Invalid patient file ID provided for deletion: {Id}", id);
                    return BadRequest(new { statusCode = 400, message = "Patient file ID cannot be empty" });
                }

                var result = await _patientFileService.DeleteAsync(id);

                _logger.LogInformation("Patient file {Id} deleted successfully", id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient file deletion {Id}", id);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Patient file not found for deletion {Id}", id);
                return NotFound(new { statusCode = 404, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Operation failed during patient file deletion {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An error occurred while deleting the patient file" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error deleting patient file {Id}", id);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while deleting the patient file" });
            }
        }

        /// <summary>
        /// Deletes a specific attachment from a patient file
        /// </summary>
        /// <param name="attachmentId">Attachment ID</param>
        /// <returns>Delete attachment response DTO</returns>
        [HttpDelete("files/attachment/{attachmentId}")]
        [ProducesResponseType(typeof(DeletePatientFileResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeletePatientFileResponseDto>> DeleteAttachment([Required] Guid attachmentId)
        {
            try
            {
                if (attachmentId == Guid.Empty)
                {
                    _logger.LogWarning("Invalid attachment ID provided for deletion: {AttachmentId}", attachmentId);
                    return BadRequest(new DeletePatientFileResponseDto
                    {
                        Success = false,
                        Message = "Attachment ID cannot be empty"
                    });
                }

                var result = await _patientFileService.DeleteAttachmentAsync(attachmentId);

                if (!result.Success)
                {
                    return NotFound(result);
                }

                _logger.LogInformation("Attachment {AttachmentId} deleted successfully", attachmentId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for attachment deletion {AttachmentId}", attachmentId);
                return BadRequest(new DeletePatientFileResponseDto
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error deleting attachment {AttachmentId}", attachmentId);
                return StatusCode(500, new DeletePatientFileResponseDto
                {
                    Success = false,
                    Message = "An unexpected error occurred while deleting the attachment"
                });
            }
        }

        /// <summary>
        /// Retrieves all patient files for a specific visit
        /// </summary>
        /// <param name="visitId">Visit ID</param>
        /// <returns>Collection of patient file response DTOs</returns>
        [HttpGet("files/visit/{visitId}")]
        [ProducesResponseType(typeof(IEnumerable<PatientFileResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<PatientFileResponseDto>>> GetByVisitId([Required] Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                {
                    _logger.LogWarning("Invalid visit ID provided: {VisitId}", visitId);
                    return BadRequest(new { statusCode = 400, message = "Visit ID cannot be empty" });
                }

                var patientFiles = await _patientFileService.GetByVisitIdAsync(visitId);
                return Ok(patientFiles);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for visit {VisitId}", visitId);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving patient files for visit {VisitId}", visitId);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while retrieving the patient files" });
            }
        }

        /// <summary>
        /// Creates a new patient file with file upload support for a specific visit
        /// </summary>
        /// <param name="dto">Create patient file request DTO</param>
        /// <param name="files">Optional files to upload</param>
        /// <returns>Created patient file response DTO</returns>
        [HttpPost("files/visit")]
        [RequestSizeLimit(10L * 1024 * 1024 * 1024)] // 10GB limit
        [ProducesResponseType(typeof(PatientFileResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PatientFileResponseDto>> CreateForVisit(
            [FromForm] CreatePatientFileRequestDto dto,
            [FromForm] ICollection<IFormFile>? files)
        {
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Null patient file data provided");
                    return BadRequest(new { statusCode = 400, message = "Patient file data cannot be null" });
                }

                if (dto.VisitId == null || dto.VisitId == Guid.Empty)
                {
                    _logger.LogWarning("Invalid visit ID provided for patient file creation");
                    return BadRequest(new { statusCode = 400, message = "Visit ID is required for this endpoint" });
                }

                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    _logger.LogWarning("Invalid model state for patient file creation: {Errors}", string.Join(", ", errors));
                    return BadRequest(new { statusCode = 400, message = "Invalid data provided", errors });
                }

                // Process files and populate the DTO in controller (presentation layer responsibility)
                if (files != null && files.Any())
                {
                    dto.Files = await ProcessFormFilesAsync(files);
                }

                var patientFile = await _patientFileService.CreateAsync(dto);

                _logger.LogInformation("Patient file created successfully with ID {Id} for visit {VisitId}", patientFile.Id, dto.VisitId);
                return CreatedAtAction(nameof(GetById), new { id = patientFile.Id }, patientFile);
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Null argument provided for patient file creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient file creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during patient file creation");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating patient file");
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while creating the patient file" });
            }
        }

        /// <summary>
        /// Deletes all patient files for a specific visit
        /// </summary>
        /// <param name="visitId">Visit ID</param>
        /// <returns>No content on successful deletion</returns>
        [HttpDelete("files/visit/{visitId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteByVisitId([Required] Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                {
                    _logger.LogWarning("Invalid visit ID provided for deletion: {VisitId}", visitId);
                    return BadRequest(new { statusCode = 400, message = "Visit ID cannot be empty" });
                }

                var result = await _patientFileService.DeleteByVisitIdAsync(visitId);

                _logger.LogInformation("Patient files for visit {VisitId} deleted successfully", visitId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for patient file deletion by visit {VisitId}", visitId);
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error deleting patient files for visit {VisitId}", visitId);
                return StatusCode(500, new { statusCode = 500, message = "An unexpected error occurred while deleting the patient files" });
            }
        }

        #region Private Helper Methods

        /// <summary>
        /// Processes form files and converts them to DTOs for service layer
        /// </summary>
        /// <param name="files">Form files collection</param>
        /// <returns>Collection of create patient file attachment request DTOs</returns>
        private async Task<ICollection<CreatePatientFileAttachmentDto>> ProcessFormFilesAsync(ICollection<IFormFile> files)
        {
            var processedFiles = new List<CreatePatientFileAttachmentDto>();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    try
                    {
                        var fileData = await GetFileBytesAsync(file);
                        processedFiles.Add(new CreatePatientFileAttachmentDto
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

