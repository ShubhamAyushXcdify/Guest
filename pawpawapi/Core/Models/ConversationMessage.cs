using System;

namespace Core.Models
{
    /// <summary>
    /// Represents a single message in a conversation
    /// Supports extensibility for future features like voice, images, attachments
    /// </summary>
    public class ConversationMessage
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        
        /// <summary>
        /// Role of the message sender: "user", "assistant", or "system"
        /// </summary>
        public string Role { get; set; } = "user";
        
        /// <summary>
        /// Text content of the message
        /// </summary>
        public string Content { get; set; } = string.Empty;
        
        /// <summary>
        /// Optional: ID of the user who sent the message (if role is "user")
        /// </summary>
        public Guid? SentByUserId { get; set; }
        
        /// <summary>
        /// Optional: JSON string for storing metadata (attachments, voice files, images, etc.)
        /// For future extensibility: {"attachments": [...], "voice_url": "...", "images": [...]}
        /// </summary>
        public string? Metadata { get; set; }
        
        /// <summary>
        /// Message order/sequence number within the conversation
        /// </summary>
        public int SequenceNumber { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        
        // Navigation properties
        public Conversation? Conversation { get; set; }
        public User? SentByUser { get; set; }
    }
}

