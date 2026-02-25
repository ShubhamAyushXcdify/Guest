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

namespace Application.Services
{
    /// <summary>
    /// Service for managing intake detail operations with optimized performance and clean architecture
    /// </summary>
    public class IntakeDetailService : IIntakeDetailService
    {
        private readonly IIntakeDetailRepository _intakeDetailRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<IntakeDetailService> _logger;

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

        public IntakeDetailService(
            IIntakeDetailRepository intakeDetailRepository,
            IVisitRepository visitRepository,
            IMapper mapper,
            ILogger<IntakeDetailService> logger)
        {
            _intakeDetailRepository = intakeDetailRepository ?? throw new ArgumentNullException(nameof(intakeDetailRepository));
            _visitRepository = visitRepository ?? throw new ArgumentNullException(nameof(visitRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves an intake detail by ID with optimized performance
        /// </summary>
        /// <param name="id">Intake detail ID</param>
        /// <returns>Intake detail response DTO</returns>
        public async Task<IntakeDetailResponseDto> GetByIdAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Intake detail ID cannot be empty", nameof(id));

                _logger.LogDebug("Retrieving intake detail {Id}", id);

                var intakeDetail = await _intakeDetailRepository.GetByIdAsync(id);
                if (intakeDetail == null)
                {
                    _logger.LogWarning("Intake detail {Id} not found", id);
                    throw new KeyNotFoundException($"Intake detail with ID {id} not found");
                }

                // Use optimized AutoMapper instead of manual mapping
                var result = _mapper.Map<IntakeDetailResponseDto>(intakeDetail);

                _logger.LogDebug("Successfully retrieved intake detail {Id}", id);
                return result;
            }
            catch (ArgumentException)
            {
                throw; // Re-throw argument exceptions as they are client errors
            }
            catch (KeyNotFoundException)
            {
                throw; // Re-throw not found exceptions as they are client errors
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve intake detail {Id}", id);
                throw new InvalidOperationException("An error occurred while retrieving the intake detail", ex);
            }
        }

        /// <summary>
        /// Retrieves an intake detail by visit ID with validation and optimized performance
        /// </summary>
        /// <param name="visitId">Visit ID</param>
        /// <returns>Intake detail response DTO</returns>
        public async Task<IntakeDetailResponseDto> GetByVisitIdAsync(Guid visitId)
        {
            try
            {
                if (visitId == Guid.Empty)
                    throw new ArgumentException("Visit ID cannot be empty", nameof(visitId));

                _logger.LogDebug("Retrieving intake detail for visit {VisitId}", visitId);

                // Validate visit exists
                await ValidateVisitExistsAsync(visitId);

                var intakeDetail = await _intakeDetailRepository.GetByVisitIdAsync(visitId);
                if (intakeDetail == null)
                {
                    _logger.LogWarning("Intake detail not found for visit {VisitId}", visitId);
                    throw new InvalidOperationException($"Intake detail not found for visit ID {visitId}");
                }

                // Use optimized AutoMapper instead of manual mapping
                var result = _mapper.Map<IntakeDetailResponseDto>(intakeDetail);

                _logger.LogDebug("Successfully retrieved intake detail for visit {VisitId}", visitId);
                return result;
            }
            catch (ArgumentException)
            {
                throw; // Re-throw argument exceptions as they are client errors
            }
            catch (InvalidOperationException)
            {
                throw; // Re-throw business logic exceptions as they are client errors
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve intake detail for visit {VisitId}", visitId);
                throw new InvalidOperationException("An error occurred while retrieving the intake detail", ex);
            }
        }

        /// <summary>
        /// Creates a new intake detail with comprehensive validation and optimized performance
        /// </summary>
        /// <param name="dto">Create intake detail request DTO</param>
        /// <returns>Created intake detail response DTO</returns>
        public async Task<IntakeDetailResponseDto> CreateAsync(CreateIntakeDetailRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto), "Intake detail data cannot be null");

                _logger.LogDebug("Creating intake detail for visit {VisitId}", dto.VisitId);

                // Comprehensive validation
                await ValidateCreateRequestAsync(dto);

                // Validate and process files if present
                if (dto.Files != null && dto.Files.Any())
                {
                    await ValidateFilesAsync(dto.Files);
                    await ProcessFilesAsync(dto.Files);
                }

                // Create intake detail entity with optimized mapping
                var intakeDetail = _mapper.Map<IntakeDetail>(dto);
                var createdIntakeDetail = await _intakeDetailRepository.CreateAsync(intakeDetail);

                // Update visit status
                if (dto.IsCompleted)
                {
                    await UpdateVisitIntakeStatusAsync(dto.VisitId, dto.IsCompleted);
                }

                // Handle file records if present
                if (dto.Files != null && dto.Files.Any())
                {
                    await CreateFileRecordsAsync(createdIntakeDetail.Id, dto.Files);
                }

                // Return complete result with optimized single query
                var result = await GetByIdAsync(createdIntakeDetail.Id);

                _logger.LogInformation("Intake detail created successfully with ID {Id} for visit {VisitId}",
                    createdIntakeDetail.Id, dto.VisitId);

                return result;
            }
            catch (ArgumentNullException)
            {
                throw; // Re-throw argument null exceptions as they are client errors
            }
            catch (ArgumentException)
            {
                throw; // Re-throw argument exceptions as they are client errors
            }
            catch (InvalidOperationException)
            {
                throw; // Re-throw business logic exceptions as they are client errors
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create intake detail for visit {VisitId}", dto?.VisitId);
                throw new InvalidOperationException("An error occurred while creating the intake detail", ex);
            }
        }

        /// <summary>
        /// Updates an existing intake detail with comprehensive validation and optimized performance
        /// </summary>
        /// <param name="dto">Update intake detail request DTO</param>
        /// <returns>Updated intake detail response DTO</returns>
        public async Task<IntakeDetailResponseDto> UpdateAsync(UpdateIntakeDetailRequestDto dto)
        {
            try
            {
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto), "Update data cannot be null");

                _logger.LogDebug("Updating intake detail {Id}", dto.Id);

                // Comprehensive validation
                await ValidateUpdateRequestAsync(dto);

                // Validate and process files if present
                if (dto.Files != null && dto.Files.Any())
                {
                    await ValidateFilesAsync(dto.Files);
                    await ProcessFilesAsync(dto.Files);
                }

                // Get existing intake detail for validation
                var existingIntakeDetail = await _intakeDetailRepository.GetByIdAsync(dto.Id);
                if (existingIntakeDetail == null)
                {
                    _logger.LogWarning("Intake detail {Id} not found for update", dto.Id);
                    throw new KeyNotFoundException($"Intake detail with ID {dto.Id} not found");
                }

                // Update intake detail with optimized mapping
                var intakeDetail = _mapper.Map<IntakeDetail>(dto);
                intakeDetail.VisitId = existingIntakeDetail.VisitId; // Preserve original visit ID
                var updatedIntakeDetail = await _intakeDetailRepository.UpdateAsync(intakeDetail);

                // Update visit status if completion status changed
                if (existingIntakeDetail.IsCompleted != dto.IsCompleted)
                {
                    await UpdateVisitIntakeStatusAsync(existingIntakeDetail.VisitId, dto.IsCompleted);
                }

                // Handle file records if present
                if (dto.Files != null && dto.Files.Any())
                {
                    await CreateFileRecordsAsync(updatedIntakeDetail.Id, dto.Files);
                }

                // Return complete result
                var result = await GetByIdAsync(updatedIntakeDetail.Id);

                _logger.LogInformation("Intake detail {Id} updated successfully", dto.Id);
                return result;
            }
            catch (ArgumentNullException)
            {
                throw; // Re-throw argument null exceptions as they are client errors
            }
            catch (ArgumentException)
            {
                throw; // Re-throw argument exceptions as they are client errors
            }
            catch (KeyNotFoundException)
            {
                throw; // Re-throw not found exceptions as they are client errors
            }
            catch (InvalidOperationException)
            {
                throw; // Re-throw business logic exceptions as they are client errors
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update intake detail {Id}", dto?.Id);
                throw new InvalidOperationException("An error occurred while updating the intake detail", ex);
            }
        }

        #region Validation Methods

        /// <summary>
        /// Validates create request data
        /// </summary>
        private async Task ValidateCreateRequestAsync(CreateIntakeDetailRequestDto dto)
        {
            if (dto.VisitId == Guid.Empty)
                throw new ArgumentException("Visit ID cannot be empty", nameof(dto.VisitId));

            // Validate visit exists
            await ValidateVisitExistsAsync(dto.VisitId);

            // Validate weight range
            if (dto.WeightKg.HasValue && (dto.WeightKg <= 0 || dto.WeightKg > 1000))
                throw new ArgumentException("Weight must be between 0.01 and 1000 kg", nameof(dto.WeightKg));

            // Validate notes length
            if (!string.IsNullOrEmpty(dto.Notes) && dto.Notes.Length > 2000)
                throw new ArgumentException("Notes cannot exceed 2000 characters", nameof(dto.Notes));
        }

        /// <summary>
        /// Validates update request data
        /// </summary>
        private async Task ValidateUpdateRequestAsync(UpdateIntakeDetailRequestDto dto)
        {
            if (dto.Id == Guid.Empty)
                throw new ArgumentException("Intake detail ID cannot be empty", nameof(dto.Id));

            // Validate weight range
            if (dto.WeightKg.HasValue && (dto.WeightKg <= 0 || dto.WeightKg > 1000))
                throw new ArgumentException("Weight must be between 0.01 and 1000 kg", nameof(dto.WeightKg));

            // Validate notes length
            if (!string.IsNullOrEmpty(dto.Notes) && dto.Notes.Length > 2000)
                throw new ArgumentException("Notes cannot exceed 2000 characters", nameof(dto.Notes));
        }

        /// <summary>
        /// Validates that a visit exists
        /// </summary>
        private async Task ValidateVisitExistsAsync(Guid visitId)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            if (visit == null)
            {
                _logger.LogWarning("Visit {VisitId} not found", visitId);
                throw new ArgumentException($"Visit with ID {visitId} does not exist", nameof(visitId));
            }
        }

        /// <summary>
        /// Validates file collection for security and size constraints
        /// </summary>
        private async Task ValidateFilesAsync(ICollection<CreateIntakeFileRequestDto> files)
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
        /// Updates visit intake completion status
        /// </summary>
        private async Task UpdateVisitIntakeStatusAsync(Guid visitId, bool isCompleted)
        {
            try
            {
                var visit = await _visitRepository.GetByIdAsync(visitId);
                if (visit != null && visit.IsIntakeCompleted != isCompleted)
                {
                    visit.IsIntakeCompleted = isCompleted;
                    await _visitRepository.UpdateAsync(visit);
                    _logger.LogDebug("Updated visit {VisitId} intake status to {IsCompleted}", visitId, isCompleted);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update visit {VisitId} intake status", visitId);
                throw new InvalidOperationException("Failed to update visit intake status", ex);
            }
        }

        /// <summary>
        /// Creates file records in batch for better performance
        /// </summary>
        private async Task CreateFileRecordsAsync(Guid intakeDetailId, ICollection<CreateIntakeFileRequestDto> files)
        {
            try
            {
                foreach (var fileDto in files)
                {
                    var intakeFile = _mapper.Map<IntakeFile>(fileDto);
                    intakeFile.IntakeDetailId = intakeDetailId;
                    await _intakeDetailRepository.AddFileAsync(intakeFile);
                }

                _logger.LogDebug("Created {Count} file records for intake detail {Id}", files.Count, intakeDetailId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create file records for intake detail {Id}", intakeDetailId);
                throw new InvalidOperationException("Failed to create file records", ex);
            }
        }

        #endregion

        #region File Processing

        /// <summary>
        /// Processes and saves files with enhanced security and performance
        /// </summary>
        private async Task ProcessFilesAsync(ICollection<CreateIntakeFileRequestDto> files)
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
                    // Generate secure unique filename
                    var sanitizedFileName = SanitizeFileName(file.FileName);
                    var fileName = $"{DateTimeOffset.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}_{sanitizedFileName}";
                    var filePath = Path.Combine(uploadDir, fileName);

                    try
                    {
                        // Save file with async I/O for better performance
                        await File.WriteAllBytesAsync(filePath, file.FileData);

                        // Update the file metadata in the DTO
                        file.FilePath = Path.Combine("Uploads", fileName);
                        file.FileSize = file.FileData.Length;
                        file.FileType = Path.GetExtension(file.FileName).ToLowerInvariant();

                        _logger.LogDebug("File '{FileName}' saved successfully to '{FilePath}'",
                            file.FileName, filePath);
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

        #endregion

        /// <summary>
        /// Deletes an intake detail with comprehensive validation and cleanup
        /// </summary>
        /// <param name="id">Intake detail ID</param>
        /// <returns>True if deleted successfully</returns>
        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                    throw new ArgumentException("Intake detail ID cannot be empty", nameof(id));

                _logger.LogDebug("Deleting intake detail {Id}", id);

                var existingIntakeDetail = await _intakeDetailRepository.GetByIdAsync(id);
                if (existingIntakeDetail == null)
                {
                    _logger.LogWarning("Intake detail {Id} not found for deletion", id);
                    throw new KeyNotFoundException($"Intake detail with ID {id} not found");
                }

                // Delete associated files first
                if (existingIntakeDetail.Files != null && existingIntakeDetail.Files.Any())
                {
                    await DeleteAssociatedFilesAsync(existingIntakeDetail.Files);
                }

                // Delete the intake detail
                var result = await _intakeDetailRepository.DeleteAsync(id);

                // Update visit status if intake was completed
                if (existingIntakeDetail.IsCompleted)
                {
                    await UpdateVisitIntakeStatusAsync(existingIntakeDetail.VisitId, false);
                }

                _logger.LogInformation("Intake detail {Id} deleted successfully", id);
                return result;
            }
            catch (ArgumentException)
            {
                throw; // Re-throw argument exceptions as they are client errors
            }
            catch (KeyNotFoundException)
            {
                throw; // Re-throw not found exceptions as they are client errors
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete intake detail {Id}", id);
                throw new InvalidOperationException("An error occurred while deleting the intake detail", ex);
            }
        }

        /// <summary>
        /// Deletes a specific file with comprehensive validation and cleanup
        /// </summary>
        /// <param name="fileId">File ID</param>
        /// <returns>Delete file response DTO</returns>
        public async Task<DeleteFileResponseDto> DeleteFileAsync(Guid fileId)
        {
            try
            {
                if (fileId == Guid.Empty)
                    throw new ArgumentException("File ID cannot be empty", nameof(fileId));

                _logger.LogDebug("Deleting file {FileId}", fileId);

                // Get file details
                var file = await _intakeDetailRepository.GetFileByIdAsync(fileId);
                if (file == null)
                {
                    _logger.LogWarning("File {FileId} not found", fileId);
                    return new DeleteFileResponseDto
                    {
                        Success = false,
                        Message = $"File with ID {fileId} not found"
                    };
                }

                // Delete physical file safely
                await DeletePhysicalFileAsync(file.FilePath);

                // Delete database record
                var result = await _intakeDetailRepository.RemoveFileAsync(fileId);
                if (!result)
                {
                    _logger.LogError("Failed to delete file record {FileId} from database", fileId);
                    return new DeleteFileResponseDto
                    {
                        Success = false,
                        Message = $"Failed to delete file record with ID {fileId}"
                    };
                }

                _logger.LogInformation("File {FileId} deleted successfully", fileId);
                return new DeleteFileResponseDto
                {
                    Success = true,
                    Message = "File deleted successfully"
                };
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for file deletion: {FileId}", fileId);
                return new DeleteFileResponseDto
                {
                    Success = false,
                    Message = ex.Message
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete file {FileId}", fileId);
                return new DeleteFileResponseDto
                {
                    Success = false,
                    Message = "An error occurred while deleting the file"
                };
            }
        }

        /// <summary>
        /// Deletes associated files both physically and from database
        /// </summary>
        private async Task DeleteAssociatedFilesAsync(ICollection<IntakeFile> files)
        {
            try
            {
                var deleteTasks = files.Select(async file =>
                {
                    // Delete physical file
                    await DeletePhysicalFileAsync(file.FilePath);

                    // Delete database record
                    await _intakeDetailRepository.RemoveFileAsync(file.Id);
                });

                await Task.WhenAll(deleteTasks);
                _logger.LogDebug("Deleted {Count} associated files", files.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete associated files");
                throw new InvalidOperationException("Failed to delete associated files", ex);
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
    }
}