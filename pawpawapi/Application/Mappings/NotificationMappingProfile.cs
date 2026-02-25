using AutoMapper;
using Core.Models;
using Application.DTOs;
using System;
using System.Text.Json;

namespace Application.Mappings
{
    public class NotificationMappingProfile : Profile
    {
        public NotificationMappingProfile()
        {
            // Notification to NotificationResponseDto
            CreateMap<Notification, NotificationResponseDto>();

            // CreateNotificationRequestDto to Notification
            CreateMap<CreateNotificationRequestDto, Notification>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.IsRead, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow));

            // UpdateNotificationRequestDto to Notification (only map non-null values)
            CreateMap<UpdateNotificationRequestDto, Notification>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // NotificationDto (real-time) to Notification (for persistence)
            CreateMap<NotificationDto, Notification>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.IsRead, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.Data, opt => opt.MapFrom(src => 
                    src.Data != null ? JsonSerializer.Serialize(src.Data, (JsonSerializerOptions?)null) : null))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
                .ForMember(dest => dest.UserId, opt => opt.Ignore()); // UserId must be set explicitly
        }
    }
}
