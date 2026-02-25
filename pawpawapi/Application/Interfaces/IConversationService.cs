using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IConversationService
    {
        /// <summary>
        /// Gets the conversation for a patient (automatically creates if doesn't exist)
        /// </summary>
        Task<ConversationWithMessagesResponseDto> GetConversationByPatientIdAsync(
            Guid patientId, 
            int pageNumber = 1, 
            int pageSize = 20, 
            bool paginationRequired = true);
        
        // Message operations - conversation is automatically found/created using patientId
        /// <summary>
        /// Sends a message (both user and AI assistant messages)
        /// Role should be "user" or "assistant"
        /// For user messages, userId will be populated from the authenticated user
        /// </summary>
        Task<ConversationMessageResponseDto> SendMessageAsync(SendMessageRequestDto dto, Guid? userId = null);
        Task<PaginatedResponseDto<ConversationMessageResponseDto>> GetMessagesByPatientIdAsync(
            Guid patientId, 
            int pageNumber = 1, 
            int pageSize = 20, 
            bool paginationRequired = true);
        Task<ConversationMessageResponseDto> UpdateMessageAsync(Guid messageId, string content, string? metadata = null);
        Task<bool> DeleteMessageAsync(Guid messageId);
    }
}

