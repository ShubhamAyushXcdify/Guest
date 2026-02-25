using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    /// <summary>
    /// Response DTO for a conversation
    /// </summary>
    public class ConversationResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public Guid? StartedByUserId { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        
        // Optional: Include patient summary info
        public string? PatientName { get; set; }
        public string? StartedByName { get; set; }
    }

    /// <summary>
    /// Response DTO for conversation with messages
    /// </summary>
    public class ConversationWithMessagesResponseDto : ConversationResponseDto
    {
        public List<ConversationMessageResponseDto> Messages { get; set; } = new();
    }

    /// <summary>
    /// Response DTO for a conversation message
    /// </summary>
    public class ConversationMessageResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; } // Added for convenience (can derive conversationId if needed)
        public string Role { get; set; } = string.Empty; // "user", "assistant", "system"
        public string Content { get; set; } = string.Empty;
        public Guid? SentByUserId { get; set; }
        public string? SentByName { get; set; }
        public string? Metadata { get; set; } // JSON string for future extensibility
        public int SequenceNumber { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    /// <summary>
    /// Request DTO for sending a message (both user and AI assistant messages)
    /// Conversation is automatically found or created using patientId
    /// </summary>
    public class SendMessageRequestDto
    {
        public Guid PatientId { get; set; }
        /// <summary>
        /// Role of the message sender: "user" or "assistant"
        /// </summary>
        public string Role { get; set; } = "user"; // "user" or "assistant"
        public string Content { get; set; } = string.Empty;
        public string? Metadata { get; set; } // JSON string for attachments, images, voice, etc.
    }

    /// <summary>
    /// Request DTO for updating a message
    /// </summary>
    public class UpdateMessageRequestDto
    {
        public string Content { get; set; } = string.Empty;
        public string? Metadata { get; set; }
    }
}

