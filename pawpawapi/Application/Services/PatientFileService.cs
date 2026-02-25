using System;
using System.Threading.Tasks;
using System.Linq;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.IO;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;

namespace Application.Services
{
    /// <summary>
    /// Service for managing patient file operations with file upload support
    /// </summary>
    public class PatientFileService : IPatientFileService
    {
        private readonly IPatientFileRepository _patientFileRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<PatientFileService> _logger;

        // Allowed file extensions for security
        private static readonly HashSet<string> AllowedFileExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp", // Images
            ".pdf", ".doc", ".docx", ".txt", ".rtf", // Documents
            ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", // Videos
            ".mp3", ".wav", ".aac", ".flac" // Audio
        };

        // Maximum file size (10GB)
        private const long MaxFileSize = 10L * 1024 * 1024 * 1024;

        public PatientFileService(
            IPatientFileRepository patientFileRepository,
            IPatientRepository patientRepository,
            IMapper mapper,
            ILogger<PatientFileService> logger)
        {
            _patientFileRepository = patientFileRepository ?? throw new ArgumentNullException(nameof(patientFileRepository));
            _patientRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves a patient file by ID with optimized performance
        /// </summary>
        /// <param name="id">Patient file ID</param>
        /// <returns>Patient file response DTO</returns>
        public async Task<PatientFileResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Patient file ID cannot be empty", nameof(id));

                _logger.LogDebug("Retrieving patient file {Id}", id);

                var patientFile = await _patientFileRepository.GetByIdAsync(id);
                if (patientFile == null)
                {
                    _logger.LogWarning("Patient file {Id} not found", id);
                    throw new KeyNotFoundException($"Patient file with ID {id} not found");
                }

                // Use optimized AutoMapper instead of manual mapping
                var result = _mapper.Map<PatientFileResponseDto>(patientFile);

                _logger.LogDebug("Successfully retrieved patient file {Id}", id);
                return result;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve patient file {Id}", id);
                throw new InvalidOperationException("An error occurred while retrieving the patient file", ex);
            }
        }

        /// <summary>
        /// Retrieves all patient files for a specific patient
        /// </summary>
        /// <param name="patientId">Patient ID</param>
        /// <returns>Collection of patient file response DTOs</returns>
        public async Task<IEnumerable<PatientFileResponseDto>> GetByPatientIdAsync(Guid patientId)
        {
            try
            {
                if (patientId == Guid.Empty)
                    throw new ArgumentException("Patient ID cannot be empty", nameof(patientId));

                _logger.LogDebug("Retrieving patient files for patient {PatientId}", patientId);

                // Validate patient exists
                await ValidatePatientExistsAsync(patientId);

                var patientFiles = await _patientFileRepository.GetByPatientIdAsync(patientId);

                // Use optimized AutoMapper instead of manual mapping
                var results = _mapper.Map<IEnumerable<PatientFileResponseDto>>(patientFiles);

                _logger.LogDebug("Successfully retrieved patient files for patient {PatientId}", patientId);
                return results;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve patient files for patient {PatientId}", patientId);
                throw new InvalidOperationException("An error occurred while retrieving the patient files", ex);
            }
        }

        /// <summary>
        /// Retrieves all patient files for a specific visit
        /// </summary>
        /// <param name="visitId">Visit ID</param>
        /// <returns>Collection of patient file response DTOs</returns>
        public async Task<IEnumerable<PatientFileResponseDto>> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    throw new ArgumentException("Visit ID cannot be empty", nameof(visitId));

                _logger.LogDebug("Retrieving patient files for visit {VisitId}", visitId);

                var patientFiles = await _patientFileRepository.GetByVisitIdAsync(visitId);

                // Use optimized AutoMapper instead of manual mapping
                var results = _mapper.Map<IEnumerable<PatientFileResponseDto>>(patientFiles);

                _logger.LogDebug("Successfully retrieved patient files for visit {VisitId}", visitId);
                return results;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve patient files for visit {VisitId}", visitId);
                throw new InvalidOperationException("An error occurred while retrieving the patient files", ex);
            }
        }

        /// <summary>
        /// Creates a new patient file with comprehensive validation and optimized performance
        /// </summary>
        /// <param name="dto">Create patient file request DTO</param>
        /// <returns>Created patient file response DTO</returns>
        public async Task<PatientFileResponseDto> CreateAsync(CreatePatientFileRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto), "Patient file data cannot be null");

                _logger.LogDebug("Creating patient file for patient {PatientId}", dto.PatientId);

                // Comprehensive validation
                await ValidateCreateRequestAsync(dto);

                // Validate and process files if present
                if (dto.Files != null && dto.Files.Any())
                {
                    await ValidateFilesAsync(dto.Files);
                    await ProcessFilesAsync(dto.Files);
                }

                // Create patient file entity with optimized mapping
                var patientFile = _mapper.Map<PatientFile>(dto);
                var createdPatientFile = await _patientFileRepository.CreateAsync(patientFile);

                // Handle file records if present
                if (dto.Files != null && dto.Files.Any())
                {
                    await CreateAttachmentRecordsAsync(createdPatientFile.Id, dto.Files);
                }

                // Return complete result with optimized single query
                var result = await GetByIdAsync(createdPatientFile.Id);

                _logger.LogInformation("Patient file created successfully with ID {Id} for patient {PatientId}",
                    createdPatientFile.Id, dto.PatientId);

                return result;
            }
            catch (ArgumentNullException)
            {
                throw;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create patient file for patient {PatientId}", dto?.PatientId);
                throw new InvalidOperationException("An error occurred while creating the patient file", ex);
            }
        }

        /// <summary>
        /// Updates an existing patient file with comprehensive validation and optimized performance
        /// </summary>
        /// <param name="dto">Update patient file request DTO</param>
        /// <returns>Updated patient file response DTO</returns>
        public async Task<PatientFileResponseDto> UpdateAsync(UpdatePatientFileRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto), "Update data cannot be null");

                _logger.LogDebug("Updating patient file {Id}", dto.Id);

                // Comprehensive validation
                await ValidateUpdateRequestAsync(dto);

                // Validate and process files if present
                if (dto.Files != null && dto.Files.Any())
                {
                    await ValidateFilesAsync(dto.Files);
                    await ProcessFilesAsync(dto.Files);
                }

                // Get existing patient file for validation
                var existingPatientFile = await _patientFileRepository.GetByIdAsync(dto.Id);
                if (existingPatientFile == null)
                {
                    _logger.LogWarning("Patient file {Id} not found for update", dto.Id);
                    throw new KeyNotFoundException($"Patient file with ID {dto.Id} not found");
                }

                // Update patient file with optimized mapping
                var patientFile = _mapper.Map<PatientFile>(dto);
                var updatedPatientFile = await _patientFileRepository.UpdateAsync(patientFile);

                // Handle file records if present
                if (dto.Files != null && dto.Files.Any())
                {
                    await CreateAttachmentRecordsAsync(updatedPatientFile.Id, dto.Files);
                }

                // Return complete result
                var result = await GetByIdAsync(updatedPatientFile.Id);

                _logger.LogInformation("Patient file {Id} updated successfully", dto.Id);
                return result;
            }
            catch (ArgumentNullException)
            {
                throw;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update patient file {Id}", dto?.Id);
                throw new InvalidOperationException("An error occurred while updating the patient file", ex);
            }
        }

        /// <summary>
        /// Deletes a patient file with comprehensive validation and cleanup
        /// </summary>
        /// <param name="id">Patient file ID</param>
        /// <returns>True if deleted successfully</returns>
        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Patient file ID cannot be empty", nameof(id));

                _logger.LogDebug("Deleting patient file {Id}", id);

                var existingPatientFile = await _patientFileRepository.GetByIdAsync(id);
                if (existingPatientFile == null)
                {
                    _logger.LogWarning("Patient file {Id} not found for deletion", id);
                    throw new KeyNotFoundException($"Patient file with ID {id} not found");
                }

                // Delete associated files first
                if (existingPatientFile.Attachments != null && existingPatientFile.Attachments.Any())
                {
                    await DeleteAssociatedAttachmentsAsync(existingPatientFile.Attachments);
                }

                // Delete the patient file
                var result = await _patientFileRepository.DeleteAsync(id);

                _logger.LogInformation("Patient file {Id} deleted successfully", id);
                return result;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete patient file {Id}", id);
                throw new InvalidOperationException("An error occurred while deleting the patient file", ex);
            }
        }

        /// <summary>
        /// Deletes all patient files for a specific visit with comprehensive validation and cleanup
        /// </summary>
        /// <param name="visitId">Visit ID</param>
        /// <returns>True if deleted successfully</returns>
        public async Task<bool> DeleteByVisitIdAsync(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    throw new ArgumentException("Visit ID cannot be empty", nameof(visitId));

                _logger.LogDebug("Deleting patient files for visit {VisitId}", visitId);

                // Get all patient files for this visit
                var existingPatientFiles = await _patientFileRepository.GetByVisitIdAsync(visitId);
                
                // Delete associated files first
                foreach (var patientFile in existingPatientFiles)
                {
                    if (patientFile.Attachments != null && patientFile.Attachments.Any())
                    {
                        await DeleteAssociatedAttachmentsAsync(patientFile.Attachments);
                    }
                }

                // Delete the patient files
                var result = await _patientFileRepository.DeleteByVisitIdAsync(visitId);

                _logger.LogInformation("Patient files for visit {VisitId} deleted successfully", visitId);
                return result;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete patient files for visit {VisitId}", visitId);
                throw new InvalidOperationException("An error occurred while deleting the patient files", ex);
            }
        }

        /// <summary>
        /// Deletes a specific attachment with comprehensive validation and cleanup
        /// </summary>
        /// <param name="attachmentId">Attachment ID</param>
        /// <returns>Delete attachment response DTO</returns>
        public async Task<DeletePatientFileResponseDto> DeleteAttachmentAsync(Guid attachmentId)
        {
            try
            {
                if (attachmentId == Guid.Empty)
                    throw new ArgumentException("Attachment ID cannot be empty", nameof(attachmentId));

                _logger.LogDebug("Deleting attachment {AttachmentId}", attachmentId);

                // Get attachment details
                var attachment = await _patientFileRepository.GetAttachmentByIdAsync(attachmentId);
                if (attachment == null)
                {
                    _logger.LogWarning("Attachment {AttachmentId} not found", attachmentId);
                    return new DeletePatientFileResponseDto
                    {
                        Success = false,
                        Message = $"Attachment with ID {attachmentId} not found"
                    };
                }

                // Delete physical file safely
                await DeletePhysicalFileAsync(attachment.FilePath);

                // Delete database record
                var result = await _patientFileRepository.RemoveAttachmentAsync(attachmentId);
                if (!result)
                {
                    _logger.LogError("Failed to delete attachment record {AttachmentId} from database", attachmentId);
                    return new DeletePatientFileResponseDto
                    {
                        Success = false,
                        Message = $"Failed to delete attachment record with ID {attachmentId}"
                    };
                }

                _logger.LogInformation("Attachment {AttachmentId} deleted successfully", attachmentId);
                return new DeletePatientFileResponseDto
                {
                    Success = true,
                    Message = "Attachment deleted successfully"
                };
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for attachment deletion: {AttachmentId}", attachmentId);
                return new DeletePatientFileResponseDto
                {
                    Success = false,
                    Message = ex.Message
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete attachment {AttachmentId}", attachmentId);
                return new DeletePatientFileResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting the attachment"
                };
            }
        }

        #region Validation Methods

        /// <summary>
        /// Validates create request data
        /// </summary>
        private async Task ValidateCreateRequestAsync(CreatePatientFileRequestDto dto)
        {
            if (dto.PatientId == Guid.Empty)
                throw new ArgumentException("Patient ID cannot be empty", nameof(dto.PatientId));

            // Validate patient exists
            await ValidatePatientExistsAsync(dto.PatientId);

            // Validate name length
            if (!string.IsNullOrEmpty(dto.Name) && dto.Name.Length > 255)
                throw new ArgumentException("Name cannot exceed 255 characters", nameof(dto.Name));
        }

        /// <summary>
        /// Validates update request data
        /// </summary>
        private async Task ValidateUpdateRequestAsync(UpdatePatientFileRequestDto dto)
        {
            if (dto.Id == Guid.Empty)
                throw new ArgumentException("Patient file ID cannot be empty", nameof(dto.Id));

            // Validate name length
            if (!string.IsNullOrEmpty(dto.Name) && dto.Name.Length > 255)
                throw new ArgumentException("Name cannot exceed 255 characters", nameof(dto.Name));
        }

        /// <summary>
        /// Validates that a patient exists
        /// </summary>
        private async Task ValidatePatientExistsAsync(Guid patientId)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                _logger.LogWarning("Patient {PatientId} not found", patientId);
                throw new ArgumentException($"Patient with ID {patientId} does not exist", nameof(patientId));
            }
        }

        /// <summary>
        /// Validates file collection for security and size constraints
        /// </summary>
        private async Task ValidateFilesAsync(ICollection<CreatePatientFileAttachmentDto> files)
        {
            if (files == null || !files.Any())
                return;

            foreach (var file in files)
            {
                // Validate file name
                if (string.IsNullOrWhiteSpace(file.FileName))
                    throw new ArgumentException("File name cannot be empty");

                // Validate file size
                if (file.FileData.Length > MaxFileSize)
                    throw new ArgumentException($"File '{file.FileName}' exceeds maximum allowed size of 10GB");

                // Validate file type for security
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!AllowedFileExtensions.Contains(fileExtension))
                    throw new ArgumentException($"File type '{fileExtension}' is not allowed for file '{file.FileName}'");

                // Validate file content (basic check)
                if (file.FileData.Length == 0)
                    throw new ArgumentException($"File '{file.FileName}' is empty");
            }

            await Task.CompletedTask; // For async consistency
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Creates attachment records in batch for better performance
        /// </summary>
        private async Task CreateAttachmentRecordsAsync(Guid patientFileId, ICollection<CreatePatientFileAttachmentDto> files)
        {
            try
            {
                foreach (var fileDto in files)
                {
                    var attachment = _mapper.Map<PatientFileAttachment>(fileDto);
                    attachment.PatientFileId = patientFileId;
                    await _patientFileRepository.AddAttachmentAsync(attachment);
                }

                _logger.LogDebug("Created {Count} attachment records for patient file {Id}", files.Count, patientFileId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create attachment records for patient file {Id}", patientFileId);
                throw new InvalidOperationException("Failed to create attachment records", ex);
            }
        }

        /// <summary>
        /// Deletes associated attachments both physically and from database
        /// </summary>
        private async Task DeleteAssociatedAttachmentsAsync(ICollection<PatientFileAttachment> attachments)
        {
            try
            {
                var deleteTasks = attachments.Select(async attachment =>
                {
                    // Delete physical file
                    await DeletePhysicalFileAsync(attachment.FilePath);

                    // Delete database record
                    await _patientFileRepository.RemoveAttachmentAsync(attachment.Id);
                });

                await Task.WhenAll(deleteTasks);
                _logger.LogDebug("Deleted {Count} associated attachments", attachments.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete associated attachments");
                throw new InvalidOperationException("Failed to delete associated attachments", ex);
            }
        }

        /// <summary>
        /// Safely deletes a physical file
        /// </summary>
        private async Task DeletePhysicalFileAsync(string filePath)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(filePath))
                    return;

                var physicalFilePath = Path.Combine(Directory.GetCurrentDirectory(), filePath);
                if (File.Exists(physicalFilePath))
                {
                    File.Delete(physicalFilePath);
                    _logger.LogDebug("Physical file deleted: {FilePath}", physicalFilePath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete physical file: {FilePath}", filePath);
                // Don't throw - physical file deletion failure shouldn't stop the operation
            }

            await Task.CompletedTask; // For async consistency
        }

        #endregion

        #region File Processing

        /// <summary>
        /// Processes and saves files with enhanced security and performance, converting images to WebP
        /// </summary>
        private async Task ProcessFilesAsync(ICollection<CreatePatientFileAttachmentDto> files)
        {
            if (files == null || !files.Any())
                return;

            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

            // Ensure upload directory exists with proper permissions
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
                _logger.LogDebug("Created upload directory: {UploadDir}", uploadDir);
            }

            var tasks = files.Select(async file =>
            {
                if (file.FileData?.Length > 0)
                {
                    // Check if file is an image that needs conversion
                    var originalExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    var isImage = IsImageFile(originalExtension);

                    try
                    {
                        byte[] fileDataToSave;
                        string finalExtension;

                        if (isImage)
                        {
                            // Convert image to WebP format
                            fileDataToSave = await ConvertImageToWebPAsync(file.FileData);
                            finalExtension = ".webp";
                            _logger.LogDebug("Converted image '{FileName}' to WebP format", file.FileName);
                        }
                        else
                        {
                            // Keep non-image files as-is
                            fileDataToSave = file.FileData;
                            finalExtension = originalExtension;
                        }

                        // Generate secure unique filename with .webp extension
                        var sanitizedBaseName = Path.GetFileNameWithoutExtension(SanitizeFileName(file.FileName));
                        var fileName = $"{Guid.NewGuid():N}{finalExtension}";
                        var filePath = Path.Combine(uploadDir, fileName);

                        // Save file with async I/O for better performance
                        await File.WriteAllBytesAsync(filePath, fileDataToSave);

                        // Update the file metadata in the DTO
                        file.FilePath = Path.Combine("Uploads", fileName);
                        file.FileSize = fileDataToSave.Length;
                        file.FileType = finalExtension;

                        _logger.LogDebug("File '{FileName}' saved successfully to '{FilePath}' as {FileType}",
                            file.FileName, filePath, finalExtension);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to save file '{FileName}'", file.FileName);
                        throw new InvalidOperationException($"Failed to save file '{file.FileName}': {ex.Message}", ex);
                    }
                }
            });

            // Process all files concurrently for better performance
            await Task.WhenAll(tasks);
        }

        /// <summary>
        /// Sanitizes file name for security
        /// </summary>
        private static string SanitizeFileName(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return "unnamed_file";

            // Remove invalid characters and limit length
            var invalidChars = Path.GetInvalidFileNameChars();
            var sanitized = string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));

            // Limit length and ensure it's not empty
            return sanitized.Length > 100 ? sanitized.Substring(0, 100) : sanitized;
        }

        /// <summary>
        /// Checks if the file is an image based on its extension
        /// </summary>
        private static bool IsImageFile(string extension)
        {
            var imageExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff"
            };
            return imageExtensions.Contains(extension);
        }

        /// <summary>
        /// Converts an image byte array to WebP format
        /// </summary>
        private static async Task<byte[]> ConvertImageToWebPAsync(byte[] imageBytes)
        {
            try
            {
                // Load image from byte array using ImageSharp
                using (var image = Image.Load(imageBytes))
                using (var ms = new MemoryStream())
                {
                    // Save as WebP with quality setting (75% is a good balance)
                    await image.SaveAsWebpAsync(ms, new WebpEncoder
                    {
                        Quality = 75
                    });
                    
                    return ms.ToArray();
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to convert image to WebP: {ex.Message}", ex);
            }
        }

        #endregion
    }
}

