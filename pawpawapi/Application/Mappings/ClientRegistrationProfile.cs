using Application.DTOs;
using AutoMapper;
using Core.Models;

namespace Application.Mappings
{
    public class ClientRegistrationProfile : Profile
    {
        public ClientRegistrationProfile()
        {
            // ClientRegistration mappings
            CreateMap<ClientRegistration, ClientRegistrationResponseDto>().ReverseMap();
            
            CreateMap<ClientRegistrationRequestDto, ClientRegistration>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.RejectionReason, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            
            CreateMap<ClientRegistration, Client>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.EncryptedPassword, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            CreateMap<ClientRegistrationRequestDto, Client>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.EncryptedPassword, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            CreateMap<Client, ClientRegistrationResponseDto>()
                .ForMember(dest => dest.Pets, opt => opt.Ignore());
        }
    }
}
