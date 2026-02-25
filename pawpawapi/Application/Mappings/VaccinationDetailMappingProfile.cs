using AutoMapper;
using Application.DTOs;
using Core.Models;

namespace Application.Mappings
{
    public class VaccinationDetailMappingProfile : Profile
    {
        public VaccinationDetailMappingProfile()
        {
            CreateMap<VaccinationDetail, VaccinationDetailResponseDto>()
                .ForMember(dest => dest.VaccinationMasterIdsDetails, opt => opt.MapFrom(src => src.VaccinationMasters != null ? src.VaccinationMasters : new List<VaccinationMaster>()));
            CreateMap<CreateVaccinationDetailRequestDto, VaccinationDetail>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            CreateMap<UpdateVaccinationDetailRequestDto, VaccinationDetail>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
        }
    }
} 