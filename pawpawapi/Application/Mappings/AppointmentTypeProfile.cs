using AutoMapper;
using Application.DTOs;
using Core.Models;

namespace Application.Mappings
{
    public class AppointmentTypeProfile : Profile
    {
        public AppointmentTypeProfile()
        {
            CreateMap<AppointmentType, AppointmentTypeResponseDto>().ReverseMap();
            
            CreateMap<CreateAppointmentTypeRequestDto, AppointmentType>()
                .ForMember(dest => dest.AppointmentTypeId, opt => opt.Ignore());
            
            CreateMap<UpdateAppointmentTypeRequestDto, AppointmentType>()
                .ForMember(dest => dest.AppointmentTypeId, opt => opt.MapFrom(src => src.Id));
        }
    }
}
