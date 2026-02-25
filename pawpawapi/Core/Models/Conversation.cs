using System;

namespace Core.Models
{
    /// <summary>
    /// Represents a conversation thread between a user and AI assistant for a specific patient
    /// One conversation per patient - automatically created when needed
    /// </summary>
    public class Conversation
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public Guid? StartedByUserId { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        
        // Navigation properties (loaded when needed)
        public Patient? Patient { get; set; }
        public User? StartedByUser { get; set; }
    }
}

