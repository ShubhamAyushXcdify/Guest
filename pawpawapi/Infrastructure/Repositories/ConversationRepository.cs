using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Dapper;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Repositories
{
    public class ConversationRepository : IConversationRepository
    {
        private readonly DapperDbContext _dbContext;
        private readonly ILogger<ConversationRepository> _logger;

        public ConversationRepository(DapperDbContext dbContext, ILogger<ConversationRepository> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Conversation?> GetByIdAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT 
                        id as Id,
                        patient_id as PatientId,
                        started_by_user_id as StartedByUserId,
                        is_active as IsActive,
                        created_at as CreatedAt,
                        updated_at as UpdatedAt
                    FROM conversations
                    WHERE id = @Id";

                return await connection.QueryFirstOrDefaultAsync<Conversation>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync for conversation {ConversationId}", id);
                throw new InvalidOperationException("Failed to retrieve conversation.", ex);
            }
        }

        public async Task<Conversation?> GetByPatientIdAsync(Guid patientId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT 
                        id as Id,
                        patient_id as PatientId,
                        started_by_user_id as StartedByUserId,
                        is_active as IsActive,
                        created_at as CreatedAt,
                        updated_at as UpdatedAt
                    FROM conversations
                    WHERE patient_id = @PatientId
                    AND is_active = true
                    ORDER BY created_at DESC
                    LIMIT 1";

                return await connection.QueryFirstOrDefaultAsync<Conversation>(sql, new { PatientId = patientId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByPatientIdAsync for patient {PatientId}", patientId);
                throw new InvalidOperationException("Failed to retrieve conversation for patient.", ex);
            }
        }

        public async Task<Conversation> GetOrCreateByPatientIdAsync(Guid patientId, Guid? userId = null)
        {
            try
            {
                // Try to get existing conversation
                var existing = await GetByPatientIdAsync(patientId);
                if (existing != null)
                {
                    return existing;
                }

                // Create new conversation if it doesn't exist
                var conversation = new Conversation
                {
                    PatientId = patientId,
                    StartedByUserId = userId,
                    IsActive = true
                };

                return await CreateAsync(conversation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetOrCreateByPatientIdAsync for patient {PatientId}", patientId);
                throw new InvalidOperationException("Failed to get or create conversation for patient.", ex);
            }
        }

        public async Task<Conversation> CreateAsync(Conversation conversation)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                using var transaction = connection.BeginTransaction();
                try
                {
                    conversation.Id = Guid.NewGuid();
                    conversation.CreatedAt = DateTimeOffset.UtcNow;
                    conversation.UpdatedAt = DateTimeOffset.UtcNow;

                    const string sql = @"
                        INSERT INTO conversations (
                            id, patient_id, started_by_user_id, is_active, created_at, updated_at
                        )
                        VALUES (
                            @Id, @PatientId, @StartedByUserId, @IsActive, @CreatedAt, @UpdatedAt
                        )
                        RETURNING id";

                    await connection.ExecuteScalarAsync<Guid>(sql, conversation, transaction);

                    transaction.Commit();
                    return conversation;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in CreateAsync for conversation");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw new InvalidOperationException("Failed to create conversation.", ex);
            }
        }

        public async Task<Conversation> UpdateAsync(Conversation conversation)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                using var transaction = connection.BeginTransaction();
                try
                {
                    conversation.UpdatedAt = DateTimeOffset.UtcNow;

                    const string sql = @"
                        UPDATE conversations
                        SET 
                            is_active = @IsActive,
                            updated_at = @UpdatedAt
                        WHERE id = @Id
                        RETURNING id";

                    var updatedId = await connection.ExecuteScalarAsync<Guid?>(sql, conversation, transaction);
                    
                    if (updatedId == null)
                    {
                        transaction.Rollback();
                        throw new KeyNotFoundException($"Conversation with id {conversation.Id} not found.");
                    }

                    transaction.Commit();
                    return conversation;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateAsync for conversation {ConversationId}", conversation.Id);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync");
                throw new InvalidOperationException("Failed to update conversation.", ex);
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                using var transaction = connection.BeginTransaction();
                try
                {
                    // Delete all messages first
                    await connection.ExecuteAsync(
                        "DELETE FROM conversation_messages WHERE conversation_id = @ConversationId",
                        new { ConversationId = id },
                        transaction);

                    // Delete conversation
                    var affectedRows = await connection.ExecuteAsync(
                        "DELETE FROM conversations WHERE id = @Id",
                        new { Id = id },
                        transaction);

                    transaction.Commit();
                    return affectedRows > 0;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in DeleteAsync for conversation {ConversationId}", id);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync");
                throw new InvalidOperationException("Failed to delete conversation.", ex);
            }
        }

        public async Task<ConversationMessage?> GetMessageByIdAsync(Guid messageId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT 
                        id as Id,
                        conversation_id as ConversationId,
                        role as Role,
                        content as Content,
                        sent_by_user_id as SentByUserId,
                        metadata as Metadata,
                        sequence_number as SequenceNumber,
                        created_at as CreatedAt,
                        updated_at as UpdatedAt
                    FROM conversation_messages
                    WHERE id = @Id";

                return await connection.QueryFirstOrDefaultAsync<ConversationMessage>(sql, new { Id = messageId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetMessageByIdAsync for message {MessageId}", messageId);
                throw new InvalidOperationException("Failed to retrieve message.", ex);
            }
        }

        public async Task<(IEnumerable<ConversationMessage> Messages, int TotalCount)> GetMessagesByConversationIdAsync(
            Guid conversationId, 
            int pageNumber = 1, 
            int pageSize = 20, 
            bool paginationRequired = true)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                var parameters = new DynamicParameters();
                parameters.Add("ConversationId", conversationId);

                // Count total messages
                const string countSql = @"
                    SELECT COUNT(1)
                    FROM conversation_messages
                    WHERE conversation_id = @ConversationId";

                var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

                // Get paginated messages
                var sql = @"
                    SELECT 
                        id as Id,
                        conversation_id as ConversationId,
                        role as Role,
                        content as Content,
                        sent_by_user_id as SentByUserId,
                        metadata as Metadata,
                        sequence_number as SequenceNumber,
                        created_at as CreatedAt,
                        updated_at as UpdatedAt
                    FROM conversation_messages
                    WHERE conversation_id = @ConversationId
                    ORDER BY sequence_number ASC, created_at ASC";

                if (paginationRequired)
                {
                    var offset = (pageNumber - 1) * pageSize;
                    sql += " LIMIT @PageSize OFFSET @Offset";
                    parameters.Add("PageSize", pageSize);
                    parameters.Add("Offset", offset);
                }

                var messages = await connection.QueryAsync<ConversationMessage>(sql, parameters);

                return (messages, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetMessagesByConversationIdAsync for conversation {ConversationId}", conversationId);
                throw new InvalidOperationException("Failed to retrieve messages for conversation.", ex);
            }
        }

        public async Task<ConversationMessage> AddMessageAsync(ConversationMessage message)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                using var transaction = connection.BeginTransaction();
                try
                {
                    message.Id = Guid.NewGuid();
                    message.CreatedAt = DateTimeOffset.UtcNow;
                    message.UpdatedAt = DateTimeOffset.UtcNow;

                    // Get next sequence number if not set
                    if (message.SequenceNumber == 0)
                    {
                        message.SequenceNumber = await GetNextSequenceNumberAsync(message.ConversationId);
                    }

                    const string sql = @"
                        INSERT INTO conversation_messages (
                            id, conversation_id, role, content, sent_by_user_id, metadata, sequence_number, created_at, updated_at
                        )
                        VALUES (
                            @Id, @ConversationId, @Role, @Content, @SentByUserId, 
                            CASE 
                                WHEN @Metadata IS NULL THEN NULL 
                                WHEN @Metadata = '' THEN NULL
                                ELSE @Metadata::jsonb 
                            END, 
                            @SequenceNumber, @CreatedAt, @UpdatedAt
                        )
                        RETURNING id";

                    await connection.ExecuteScalarAsync<Guid>(sql, message, transaction);

                    // Update conversation's updated_at timestamp
                    await connection.ExecuteAsync(
                        "UPDATE conversations SET updated_at = @UpdatedAt WHERE id = @Id",
                        new { UpdatedAt = DateTimeOffset.UtcNow, Id = message.ConversationId },
                        transaction);

                    transaction.Commit();
                    return message;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in AddMessageAsync for conversation {ConversationId}", message.ConversationId);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddMessageAsync");
                throw new InvalidOperationException("Failed to add message.", ex);
            }
        }

        public async Task<ConversationMessage> UpdateMessageAsync(ConversationMessage message)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                using var transaction = connection.BeginTransaction();
                try
                {
                    message.UpdatedAt = DateTimeOffset.UtcNow;

                    const string sql = @"
                        UPDATE conversation_messages
                        SET 
                            content = @Content,
                            metadata = CASE 
                                WHEN @Metadata IS NULL THEN NULL 
                                WHEN @Metadata = '' THEN NULL
                                ELSE @Metadata::jsonb 
                            END,
                            updated_at = @UpdatedAt
                        WHERE id = @Id
                        RETURNING id";

                    var updatedId = await connection.ExecuteScalarAsync<Guid?>(sql, message, transaction);
                    
                    if (updatedId == null)
                    {
                        transaction.Rollback();
                        throw new KeyNotFoundException($"Message with id {message.Id} not found.");
                    }

                    transaction.Commit();
                    return message;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in UpdateMessageAsync for message {MessageId}", message.Id);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateMessageAsync");
                throw new InvalidOperationException("Failed to update message.", ex);
            }
        }

        public async Task<bool> DeleteMessageAsync(Guid messageId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                using var transaction = connection.BeginTransaction();
                try
                {
                    var affectedRows = await connection.ExecuteAsync(
                        "DELETE FROM conversation_messages WHERE id = @Id",
                        new { Id = messageId },
                        transaction);

                    transaction.Commit();
                    return affectedRows > 0;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    _logger.LogError(ex, "Error in DeleteMessageAsync for message {MessageId}", messageId);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteMessageAsync");
                throw new InvalidOperationException("Failed to delete message.", ex);
            }
        }

        public async Task<int> GetNextSequenceNumberAsync(Guid conversationId)
        {
            try
            {
                using var connection = _dbContext.GetConnection();
                const string sql = @"
                    SELECT COALESCE(MAX(sequence_number), 0) + 1
                    FROM conversation_messages
                    WHERE conversation_id = @ConversationId";

                return await connection.ExecuteScalarAsync<int>(sql, new { ConversationId = conversationId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetNextSequenceNumberAsync for conversation {ConversationId}", conversationId);
                throw new InvalidOperationException("Failed to get next sequence number.", ex);
            }
        }
    }
}

