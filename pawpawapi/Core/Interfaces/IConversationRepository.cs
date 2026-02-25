using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface IConversationRepository
    {
        Task<Conversation?> GetByIdAsync(Guid id);
        Task<Conversation?> GetByPatientIdAsync(Guid patientId);
        /// <summary>
        /// Gets existing conversation for patient, or creates a new one if it doesn't exist
        /// One conversation per patient - automatically managed
        /// </summary>
        Task<Conversation> GetOrCreateByPatientIdAsync(Guid patientId, Guid? userId = null);
        Task<Conversation> CreateAsync(Conversation conversation);
        Task<Conversation> UpdateAsync(Conversation conversation);
        Task<bool> DeleteAsync(Guid id);
        
        // Message operations
        Task<ConversationMessage?> GetMessageByIdAsync(Guid messageId);
        Task<(IEnumerable<ConversationMessage> Messages, int TotalCount)> GetMessagesByConversationIdAsync(
            Guid conversationId, 
            int pageNumber = 1, 
            int pageSize = 20, 
            bool paginationRequired = true);
        Task<ConversationMessage> AddMessageAsync(ConversationMessage message);
        Task<ConversationMessage> UpdateMessageAsync(ConversationMessage message);
        Task<bool> DeleteMessageAsync(Guid messageId);
        Task<int> GetNextSequenceNumberAsync(Guid conversationId);
    }
}

