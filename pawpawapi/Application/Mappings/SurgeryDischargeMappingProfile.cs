using Application.DTOs;
using AutoMapper;
using Core.Models;

namespace Application.Mappings
{
    public class SurgeryDischargeMappingProfile : Profile
    {
        public SurgeryDischargeMappingProfile()
        {
            CreateMap<SurgeryDischarge, SurgeryDischargeResponseDto>();
            CreateMap<CreateSurgeryDischargeRequestDto, SurgeryDischarge>();
            CreateMap<UpdateSurgeryDischargeRequestDto, SurgeryDischarge>();
        }
    }
} 