using AutoMapper;
using Application.DTOs;
using Core.Models;

namespace Application.Mappings
{
    public class ScreenProfile : Profile
    {
        public ScreenProfile()
        {
            CreateMap<Screen, ScreenResponseDto>().ReverseMap();

            CreateMap<CreateScreenRequestDto, Screen>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            CreateMap<UpdateScreenRequestDto, Screen>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // ScreenAccess mappings
            CreateMap<ScreenAccess, ScreenAccessResponseDto>().ReverseMap();
        }
    }
}
