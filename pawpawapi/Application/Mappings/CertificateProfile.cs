using Application.DTOs;
using AutoMapper;
using Core.Models;

namespace Application.Mappings
{
    public class CertificateProfile : Profile
    {
        public CertificateProfile()
        {
            // Map from Model to ResponseDto
            CreateMap<Certificate, CertificateResponseDto>();
            
            // Map from Model to Item ResponseDto
            CreateMap<Certificate, CertificateItemResponseDto>();

            // Map from CertificateItemRequestDto to Certificate Model
            CreateMap<CertificateItemRequestDto, Certificate>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.VisitId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // Map from UpdateCertificateItemRequestDto to Certificate Model
            CreateMap<UpdateCertificateItemRequestDto, Certificate>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.VisitId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
        }
    }
}
