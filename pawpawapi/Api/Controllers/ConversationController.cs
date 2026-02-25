using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ConversationController : ControllerBase
    {
        private readonly IConversationService _conversationService;
        private readonly ILogger<ConversationController> _logger;

        public ConversationController(
            IConversationService conversationService,
            ILogger<ConversationController> logger)
        {
            _conversationService = conversationService ?? throw new ArgumentNullException(nameof(conversationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get current user ID from claims
        /// </summary>
        private Guid? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return null;
        }

        /// <summary>
        /// Get conversation with all messages for a patient
        /// Conversation is automatically created if it doesn't exist
        /// </summary>
        [HttpGet("patient/{patientId}")]
        [ProducesResponseType(typeof(ConversationWithMessagesResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<ConversationWithMessagesResponseDto>> GetConversationByPatientId(
            Guid patientId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool paginationRequired = true)
        {
            try
            {
                if (patientId == Guid.Empty)
                {
                    return BadRequest(new { message = "Patient ID is required." });
                }

                if (pageNumber < 1)
                {
                    return BadRequest(new { message = "Page number must be greater than 0." });
                }

                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest(new { message = "Page size must be between 1 and 100." });
                }

                var conversation = await _conversationService.GetConversationByPatientIdAsync(
                    patientId, 
                    pageNumber, 
                    pageSize, 
                    paginationRequired);
                return Ok(conversation);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving conversation for patient {PatientId}", patientId);
                return StatusCode(500, new { message = "An error occurred while retrieving the conversation." });
            }
        }

        /// <summary>
        /// Send a message in a patient's conversation (handles both user and AI assistant messages)
        /// Conversation is automatically created if it doesn't exist
        /// Set role to "user" for user messages, "assistant" for AI messages
        /// </summary>
        [HttpPost("messages")]
        [ProducesResponseType(typeof(ConversationMessageResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<ConversationMessageResponseDto>> SendMessage(
            [FromBody] SendMessageRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { message = "Message data is required." });
                }

                if (dto.PatientId == Guid.Empty)
                {
                    return BadRequest(new { message = "Patient ID is required." });
                }

                if (string.IsNullOrWhiteSpace(dto.Content))
                {
                    return BadRequest(new { message = "Message content is required." });
                }

                // Validate role
                if (!string.IsNullOrWhiteSpace(dto.Role) && dto.Role != "user" && dto.Role != "assistant")
                {
                    return BadRequest(new { message = "Role must be either 'user' or 'assistant'." });
                }

                // Default role to "user" if not specified
                if (string.IsNullOrWhiteSpace(dto.Role))
                {
                    dto.Role = "user";
                }

                // Get userId only for user messages (from JWT token)
                Guid? userId = null;
                if (dto.Role == "user")
                {
                    userId = GetCurrentUserId();
                    if (!userId.HasValue)
                    {
                        return Unauthorized(new { message = "User ID is required for user messages. Please ensure you are authenticated." });
                    }
                }

                var message = await _conversationService.SendMessageAsync(dto, userId);
                return Ok(message);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error sending message for patient {PatientId}: {Message}", dto?.PatientId, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found when sending message for patient {PatientId}: {Message}", dto?.PatientId, ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message for patient {PatientId}. Exception: {ExceptionType}, Message: {Message}, StackTrace: {StackTrace}", 
                    dto?.PatientId, ex.GetType().Name, ex.Message, ex.StackTrace);
                return StatusCode(500, new { message = "An error occurred while sending the message.", details = ex.Message });
            }
        }

        /// <summary>
        /// Get all messages for a patient's conversation
        /// Conversation is automatically created if it doesn't exist
        /// </summary>
        [HttpGet("patient/{patientId}/messages")]
        [ProducesResponseType(typeof(PaginatedResponseDto<ConversationMessageResponseDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<PaginatedResponseDto<ConversationMessageResponseDto>>> GetMessages(
            Guid patientId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool paginationRequired = true)
        {
            try
            {
                if (patientId == Guid.Empty)
                {
                    return BadRequest(new { message = "Patient ID is required." });
                }

                if (pageNumber < 1)
                {
                    return BadRequest(new { message = "Page number must be greater than 0." });
                }

                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest(new { message = "Page size must be between 1 and 100." });
                }

                var messages = await _conversationService.GetMessagesByPatientIdAsync(
                    patientId, 
                    pageNumber, 
                    pageSize, 
                    paginationRequired);
                return Ok(messages);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving messages for patient {PatientId}", patientId);
                return StatusCode(500, new { message = "An error occurred while retrieving messages." });
            }
        }

        /// <summary>
        /// Update a message
        /// </summary>
        [HttpPut("messages/{messageId}")]
        [ProducesResponseType(typeof(ConversationMessageResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<ConversationMessageResponseDto>> UpdateMessage(
            Guid messageId,
            [FromBody] UpdateMessageRequestDto dto)
        {
            try
            {
                if (messageId == Guid.Empty)
                {
                    return BadRequest(new { message = "Message ID is required." });
                }

                if (dto == null)
                {
                    return BadRequest(new { message = "Update data is required." });
                }

                if (string.IsNullOrWhiteSpace(dto.Content))
                {
                    return BadRequest(new { message = "Message content is required." });
                }

                var message = await _conversationService.UpdateMessageAsync(messageId, dto.Content, dto.Metadata);
                return Ok(message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating message {MessageId}", messageId);
                return StatusCode(500, new { message = "An error occurred while updating the message." });
            }
        }

        /// <summary>
        /// Delete a message
        /// </summary>
        [HttpDelete("messages/{messageId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> DeleteMessage(Guid messageId)
        {
            try
            {
                if (messageId == Guid.Empty)
                {
                    return BadRequest(new { message = "Message ID is required." });
                }

                var deleted = await _conversationService.DeleteMessageAsync(messageId);
                if (!deleted)
                {
                    return NotFound(new { message = "Message not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting message {MessageId}", messageId);
                return StatusCode(500, new { message = "An error occurred while deleting the message." });
            }
        }
    }
}
