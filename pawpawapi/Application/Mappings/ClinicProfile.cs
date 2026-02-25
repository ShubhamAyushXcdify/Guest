using Application.DTOs;
using AutoMapper;
using Core.Models;

namespace Application.Mappings
{
    public class ClinicProfile : Profile
    {
        public ClinicProfile()
        {
            // Clinic mappings
            CreateMap<Clinic, ClinicResponseDto>().ReverseMap();
            
            CreateMap<CreateClinicRequestDto, Clinic>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CompanyName, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            CreateMap<UpdateClinicRequestDto, Clinic>()
                .ForMember(dest => dest.CompanyName, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore()); // Don't allow updating IsActive through normal update

            // Location mappings
            CreateMap<Core.Models.Location, LocationDto>().ReverseMap();
        }
    }
}
