using AutoMapper;
using Application.DTOs;
using Core.Models;

namespace Application.Mappings
{
    /// <summary>
    /// AutoMapper profile for IntakeDetail and IntakeFile mappings
    /// </summary>
    public class IntakeDetailMappingProfile : Profile
    {
        public IntakeDetailMappingProfile()
        {
            // IntakeDetail mappings
            CreateMap<IntakeDetail, IntakeDetailResponseDto>()
                .ForMember(dest => dest.Files, opt => opt.MapFrom(src => src.Files));

            CreateMap<CreateIntakeDetailRequestDto, IntakeDetail>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Visit, opt => opt.Ignore())
                .ForMember(dest => dest.Files, opt => opt.Ignore());

            CreateMap<UpdateIntakeDetailRequestDto, IntakeDetail>()
                .ForMember(dest => dest.VisitId, opt => opt.Ignore()) // Don't allow changing visit ID
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Visit, opt => opt.Ignore())
                .ForMember(dest => dest.Files, opt => opt.Ignore());

            // IntakeFile mappings
            CreateMap<IntakeFile, IntakeFileResponseDto>();

            CreateMap<CreateIntakeFileRequestDto, IntakeFile>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IntakeDetailId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IntakeDetail, opt => opt.Ignore());
        }
    }
}
