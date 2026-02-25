using AutoMapper;
using Core.Models;
using Application.DTOs;

namespace Application.Mappings
{
    public class VisitMappingProfile : Profile
    {
        public VisitMappingProfile()
        {
            // The following mapping will automatically include new deworming completion fields if property names match
            CreateMap<Visit, VisitResponseDto>().ReverseMap();
            CreateMap<CreateVisitRequestDto, Visit>();
            CreateMap<UpdateVisitRequestDto, Visit>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
} 