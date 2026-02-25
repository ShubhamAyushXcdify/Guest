using Application.DTOs;
using AutoMapper;
using Core.Models;
using System;

namespace Application.Mappings
{
    public class UserClinicSlotsMappingProfile : Profile
    {
        public UserClinicSlotsMappingProfile()
        {
            // Map UserDoctorSlot (with extended properties from JOIN) to UserSlotDto
            CreateMap<UserDoctorSlot, UserSlotDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.SlotId))
                .ForMember(dest => dest.Day, opt => opt.MapFrom(src => src.Day ?? string.Empty))
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.StartTime.HasValue ? src.StartTime.Value : TimeSpan.Zero))
                .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.EndTime.HasValue ? src.EndTime.Value : TimeSpan.Zero))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.SlotCreatedAt.HasValue ? src.SlotCreatedAt.Value : DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.SlotUpdatedAt.HasValue ? src.SlotUpdatedAt.Value : DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive.HasValue ? src.IsActive.Value : false))
                .ForMember(dest => dest.ClinicId, opt => opt.MapFrom(src => src.ClinicId));
        }
    }
}

