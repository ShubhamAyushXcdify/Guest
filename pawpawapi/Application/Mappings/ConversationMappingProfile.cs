using AutoMapper;
using Application.DTOs;
using Core.Models;

namespace Application.Mappings
{
    public class ConversationMappingProfile : Profile
    {
        public ConversationMappingProfile()
        {
            // Conversation mappings
            CreateMap<Conversation, ConversationResponseDto>()
                .ForMember(dest => dest.PatientName, opt => opt.Ignore())
                .ForMember(dest => dest.StartedByName, opt => opt.Ignore());

            CreateMap<Conversation, ConversationWithMessagesResponseDto>()
                .ForMember(dest => dest.PatientName, opt => opt.Ignore())
                .ForMember(dest => dest.StartedByName, opt => opt.Ignore())
                .ForMember(dest => dest.Messages, opt => opt.Ignore());

            // ConversationMessage mappings
            CreateMap<ConversationMessage, ConversationMessageResponseDto>()
                .ForMember(dest => dest.PatientId, opt => opt.Ignore())
                .ForMember(dest => dest.SentByName, opt => opt.Ignore());
        }
    }
}

