using AutoMapper;
using Core.Models;
using Application.DTOs;

namespace Application.Mappings
{
    public class PatientMappingProfile : Profile
    {
        public PatientMappingProfile()
        {
            CreateMap<Patient, PatientResponseDto>();
            
            CreateMap<CreatePatientRequestDto, Patient>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src =>
                    string.IsNullOrWhiteSpace(src.Gender)
                        ? null
                        : (src.Gender.Trim().ToLower() == "male"
                            ? "male"
                            : (src.Gender.Trim().ToLower() == "female"
                                ? "female"
                                : "unknown"))));

            CreateMap<CreatePatientForRegistrationRequestDto, CreatePatientRequestDto>()
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth.DateTime));

            CreateMap<UpdatePatientRequestDto, Patient>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src =>
                    string.IsNullOrWhiteSpace(src.Gender)
                        ? null
                        : (src.Gender.Trim().ToLower() == "male"
                            ? "male"
                            : (src.Gender.Trim().ToLower() == "female"
                                ? "female"
                                : "unknown"))));
        }
    }
} 