using AutoMapper;
using Application.DTOs;
using Core.Models;

namespace Application.Mappings
{
    public class DewormingVisitProfile : Profile
    {
        public DewormingVisitProfile()
        {
            // DewormingIntake mappings
            CreateMap<DewormingIntake, DewormingIntakeResponseDto>().ReverseMap();
            
            CreateMap<CreateDewormingIntakeRequestDto, DewormingIntake>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            
            CreateMap<UpdateDewormingIntakeRequestDto, DewormingIntake>()
                .ForMember(dest => dest.VisitId, opt => opt.Ignore()) // Don't allow changing visit ID
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // DewormingMedication mappings
            CreateMap<DewormingMedication, DewormingMedicationResponseDto>().ReverseMap();
            
            CreateMap<CreateDewormingMedicationRequestDto, DewormingMedication>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            
            CreateMap<UpdateDewormingMedicationRequestDto, DewormingMedication>()
                .ForMember(dest => dest.VisitId, opt => opt.Ignore()) // Don't allow changing visit ID
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // DewormingNote mappings
            CreateMap<DewormingNote, DewormingNoteResponseDto>().ReverseMap();
            
            CreateMap<CreateDewormingNoteRequestDto, DewormingNote>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            
            CreateMap<UpdateDewormingNoteRequestDto, DewormingNote>()
                .ForMember(dest => dest.VisitId, opt => opt.Ignore()) // Don't allow changing visit ID
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // DewormingCheckout mappings
            CreateMap<DewormingCheckout, DewormingCheckoutResponseDto>().ReverseMap();
            
            CreateMap<CreateDewormingCheckoutRequestDto, DewormingCheckout>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            
            CreateMap<UpdateDewormingCheckoutRequestDto, DewormingCheckout>()
                .ForMember(dest => dest.VisitId, opt => opt.Ignore()) // Don't allow changing visit ID
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
        }
    }
}
