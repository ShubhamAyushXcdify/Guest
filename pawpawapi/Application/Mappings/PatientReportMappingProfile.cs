using AutoMapper;
using Application.DTOs;
using Core.Models;

namespace Application.Mappings
{
    /// <summary>
    /// AutoMapper profile for PatientReport mappings
    /// </summary>
    public class PatientReportMappingProfile : Profile
    {
        public PatientReportMappingProfile()
        {
            // PatientReport mappings
            CreateMap<PatientReport, PatientReportResponseDto>()
                .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => 
                    src.Doctor != null ? $"{src.Doctor.FirstName} {src.Doctor.LastName}" : string.Empty))
                .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => 
                    src.Creator != null ? $"{src.Creator.FirstName} {src.Creator.LastName}" : string.Empty));

            CreateMap<CreatePatientReportRequestDto, PatientReport>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Patient, opt => opt.Ignore())
                .ForMember(dest => dest.Doctor, opt => opt.Ignore())
                .ForMember(dest => dest.Creator, opt => opt.Ignore());

            CreateMap<UpdatePatientReportRequestDto, PatientReport>()
                .ForMember(dest => dest.PatientId, opt => opt.Ignore()) // Don't allow changing patient ID
                .ForMember(dest => dest.DoctorId, opt => opt.Ignore()) // Don't allow changing doctor ID
                .ForMember(dest => dest.CreatedById, opt => opt.Ignore()) // Don't allow changing created by ID
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Patient, opt => opt.Ignore())
                .ForMember(dest => dest.Doctor, opt => opt.Ignore())
                .ForMember(dest => dest.Creator, opt => opt.Ignore());
        }
    }
}

