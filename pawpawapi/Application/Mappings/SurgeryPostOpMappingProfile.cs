using Application.DTOs;
using AutoMapper;
using Core.Models;

namespace Application.Mappings
{
    public class SurgeryPostOpMappingProfile : Profile
    {
        public SurgeryPostOpMappingProfile()
        {
            CreateMap<SurgeryPostOp, SurgeryPostOpResponseDto>();
            CreateMap<CreateSurgeryPostOpRequestDto, SurgeryPostOp>();
            CreateMap<UpdateSurgeryPostOpRequestDto, SurgeryPostOp>();
        }
    }
} 