using Application.DTOs;
using AutoMapper;
using Core.Models;

namespace Application.Mappings
{
    public class ComplaintDetailProfile : Profile
    {
        public ComplaintDetailProfile()
        {
            // ComplaintDetail mappings
            CreateMap<ComplaintDetail, ComplaintDetailResponseDto>().ReverseMap();
            
            CreateMap<CreateComplaintDetailRequestDto, ComplaintDetail>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Symptoms, opt => opt.Ignore());
            
            CreateMap<UpdateComplaintDetailRequestDto, ComplaintDetail>()
                .ForMember(dest => dest.VisitId, opt => opt.Ignore()) // Don't allow changing visit ID
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Symptoms, opt => opt.Ignore());
        }
    }
}
