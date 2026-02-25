using AutoMapper;
using Application.DTOs;
using Core.Models;

namespace Application.Mappings
{
    public class AppointmentProfile : Profile
    {
        public AppointmentProfile()
        {
            CreateMap<Appointment, AppointmentResponseDto>().ReverseMap();
            CreateMap<CreateAppointmentRequestDto, Appointment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CompanyId, opt => opt.Ignore()) // CompanyId will be set by service logic
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            CreateMap<UpdateAppointmentRequestDto, Appointment>()
                .ForMember(dest => dest.CompanyId, opt => opt.Ignore()) // CompanyId will be set by service logic
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
        }
    }
}
