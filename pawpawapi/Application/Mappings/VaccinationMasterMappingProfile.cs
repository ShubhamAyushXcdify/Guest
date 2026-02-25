using AutoMapper;
using Application.DTOs;
using Core.Models;

namespace Application.Mappings
{
    public class VaccinationMasterMappingProfile : Profile
    {
        public VaccinationMasterMappingProfile()
        {
            CreateMap<VaccinationMaster, VaccinationMasterResponseDto>();
            CreateMap<CreateVaccinationMasterRequestDto, VaccinationMaster>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            CreateMap<UpdateVaccinationMasterRequestDto, VaccinationMaster>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
        }
    }
} 