using AutoMapper;
using Application.DTOs;
using Core.Models;

namespace Application.Mappings
{
    public class DoctorSlotMappingProfile : Profile
    {
        public DoctorSlotMappingProfile()
        {
            CreateMap<DoctorSlot, DoctorSlotDto>().ReverseMap();

            CreateMap<CreateDoctorSlotDto, DoctorSlot>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore());

            CreateMap<UpdateDoctorSlotDto, DoctorSlot>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}