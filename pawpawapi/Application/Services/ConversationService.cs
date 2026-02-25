using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Logging;

namespace Application.Services
{
    public class ConversationService : IConversationService
    {
        private readonly IConversationRepository _conversationRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ConversationService> _logger;

        public ConversationService(
            IConversationRepository conversationRepository,
            IPatientRepository patientRepository,
            IUserRepository userRepository,
            IMapper mapper,
            ILogger<ConversationService> logger)
        {
            _conversationRepository = conversationRepository ?? throw new ArgumentNullException(nameof(conversationRepository));
            _patientRepository = patientRepository ?? throw new ArgumentNullException(nameof(patientRepository));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ConversationWithMessagesResponseDto> GetConversationByPatientIdAsync(
            Guid patientId, 
            int pageNumber = 1, 
            int pageSize = 20, 
            bool paginationRequired = true)
        {
            try
            {
                // Validate patient exists
                var patient = await _patientRepository.GetByIdAsync(patientId);
                if (patient == null)
                {
                    throw new KeyNotFoundException($"Patient with id {patientId} not found.");
                }

                // Get or create conversation for this patient
                var conversation = await _conversationRepository.GetOrCreateByPatientIdAsync(patientId);
                var (messages, totalCount) = await _conversationRepository.GetMessagesByConversationIdAsync(
                    conversation.Id, 
                    pageNumber, 
                    pageSize, 
                    paginationRequired);

                var response = _mapper.Map<ConversationWithMessagesResponseDto>(conversation);
                response.PatientName = patient.Name;

                // Collect all unique user IDs (conversation starter + message senders)
                var userIds = new HashSet<Guid>();
                if (conversation.StartedByUserId.HasValue)
                {
                    userIds.Add(conversation.StartedByUserId.Value);
                }
                
                var messageUserIds = messages
                    .Where(m => m.SentByUserId.HasValue)
                    .Select(m => m.SentByUserId!.Value)
                    .Distinct();
                
                foreach (var userId in messageUserIds)
                {
                    userIds.Add(userId);
                }

                // Batch load all users in a single query
                var users = await _userRepository.GetByIdsAsync(userIds);

                // Populate started by user name
                if (conversation.StartedByUserId.HasValue && users.TryGetValue(conversation.StartedByUserId.Value, out var startedByUser))
                {
                    response.StartedByName = $"{startedByUser.FirstName} {startedByUser.LastName}".Trim();
                }

                // Map messages
                foreach (var message in messages)
                {
                    var messageDto = _mapper.Map<ConversationMessageResponseDto>(message);
                    messageDto.PatientId = patientId; // Set patientId for convenience

                    if (message.SentByUserId.HasValue && users.TryGetValue(message.SentByUserId.Value, out var messageUser))
                    {
                        messageDto.SentByName = $"{messageUser.FirstName} {messageUser.LastName}".Trim();
                    }

                    response.Messages.Add(messageDto);
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetConversationByPatientIdAsync for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<ConversationMessageResponseDto> SendMessageAsync(SendMessageRequestDto dto, Guid? userId = null)
        {
            try
            {
                // Validate role
                if (string.IsNullOrWhiteSpace(dto.Role))
                {
                    dto.Role = "user"; // Default to user if not specified
                }

                if (dto.Role != "user" && dto.Role != "assistant")
                {
                    throw new ArgumentException("Role must be either 'user' or 'assistant'.");
                }

                // Validate patient exists
                var patient = await _patientRepository.GetByIdAsync(dto.PatientId);
                if (patient == null)
                {
                    throw new KeyNotFoundException($"Patient with id {dto.PatientId} not found.");
                }

                // Get or create conversation for this patient
                // For user messages, pass userId; for assistant messages, it will be null
                var conversationUserId = dto.Role == "user" ? userId : null;
                var conversation = await _conversationRepository.GetOrCreateByPatientIdAsync(dto.PatientId, conversationUserId);

                var message = new ConversationMessage
                {
                    ConversationId = conversation.Id,
                    Role = dto.Role,
                    Content = dto.Content,
                    SentByUserId = dto.Role == "user" ? userId : null, // Only user messages have userId
                    Metadata = dto.Metadata
                };

                var created = await _conversationRepository.AddMessageAsync(message);
                var response = _mapper.Map<ConversationMessageResponseDto>(created);
                response.PatientId = dto.PatientId; // Set patientId for convenience

                // Populate sent by user name only for user messages
                if (dto.Role == "user" && userId.HasValue)
                {
                    var users = await _userRepository.GetByIdsAsync(new[] { userId.Value });
                    if (users.TryGetValue(userId.Value, out var user))
                    {
                        response.SentByName = $"{user.FirstName} {user.LastName}".Trim();
                    }
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendMessageAsync for patient {PatientId} with role {Role}", dto.PatientId, dto.Role);
                throw;
            }
        }

        public async Task<PaginatedResponseDto<ConversationMessageResponseDto>> GetMessagesByPatientIdAsync(
            Guid patientId, 
            int pageNumber = 1, 
            int pageSize = 20, 
            bool paginationRequired = true)
        {
            try
            {
                // Validate patient exists
                var patient = await _patientRepository.GetByIdAsync(patientId);
                if (patient == null)
                {
                    throw new KeyNotFoundException($"Patient with id {patientId} not found.");
                }

                // Get or create conversation for this patient
                var conversation = await _conversationRepository.GetOrCreateByPatientIdAsync(patientId);
                var (messages, totalCount) = await _conversationRepository.GetMessagesByConversationIdAsync(
                    conversation.Id, 
                    pageNumber, 
                    pageSize, 
                    paginationRequired);

                var responses = new List<ConversationMessageResponseDto>();

                // Get unique user IDs and batch load all users in a single query
                var userIds = messages
                    .Where(m => m.SentByUserId.HasValue)
                    .Select(m => m.SentByUserId!.Value)
                    .Distinct()
                    .ToList();

                var users = await _userRepository.GetByIdsAsync(userIds);

                // Map messages
                foreach (var message in messages)
                {
                    var messageDto = _mapper.Map<ConversationMessageResponseDto>(message);
                    messageDto.PatientId = patientId; // Set patientId for convenience

                    if (message.SentByUserId.HasValue && users.TryGetValue(message.SentByUserId.Value, out var messageUser))
                    {
                        messageDto.SentByName = $"{messageUser.FirstName} {messageUser.LastName}".Trim();
                    }

                    responses.Add(messageDto);
                }

                var totalPages = paginationRequired ? (int)Math.Ceiling(totalCount / (double)pageSize) : 1;

                return new PaginatedResponseDto<ConversationMessageResponseDto>
                {
                    Items = responses,
                    TotalCount = totalCount,
                    PageNumber = paginationRequired ? pageNumber : 1,
                    PageSize = paginationRequired ? pageSize : totalCount,
                    TotalPages = totalPages,
                    HasPreviousPage = paginationRequired && pageNumber > 1,
                    HasNextPage = paginationRequired && pageNumber < totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetMessagesByPatientIdAsync for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<ConversationMessageResponseDto> UpdateMessageAsync(Guid messageId, string content, string? metadata = null)
        {
            try
            {
                var existing = await _conversationRepository.GetMessageByIdAsync(messageId);
                if (existing == null)
                {
                    throw new KeyNotFoundException($"Message with id {messageId} not found.");
                }

                existing.Content = content;
                if (metadata != null)
                {
                    existing.Metadata = metadata;
                }

                var updated = await _conversationRepository.UpdateMessageAsync(existing);
                var response = _mapper.Map<ConversationMessageResponseDto>(updated);

                // Get conversation to set patientId
                var conversation = await _conversationRepository.GetByIdAsync(updated.ConversationId);
                if (conversation != null)
                {
                    response.PatientId = conversation.PatientId;
                }

                // Populate sent by user name
                if (updated.SentByUserId.HasValue)
                {
                    var users = await _userRepository.GetByIdsAsync(new[] { updated.SentByUserId.Value });
                    if (users.TryGetValue(updated.SentByUserId.Value, out var user))
                    {
                        response.SentByName = $"{user.FirstName} {user.LastName}".Trim();
                    }
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateMessageAsync for message {MessageId}", messageId);
                throw;
            }
        }

        public async Task<bool> DeleteMessageAsync(Guid messageId)
        {
            try
            {
                return await _conversationRepository.DeleteMessageAsync(messageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteMessageAsync for message {MessageId}", messageId);
                throw;
            }
        }
    }
}
