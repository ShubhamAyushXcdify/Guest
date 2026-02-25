using Application.DTOs;
using AutoMapper;
using Core.Models;

namespace Application.Mappings
{
    public class ClientProfile : Profile
    {
        public ClientProfile()
        {
            // Client mappings
            CreateMap<Client, ClientResponseDto>().ReverseMap();
            
            CreateMap<CreateClientRequestDto, Client>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.EncryptedPassword, opt => opt.Ignore());
            
            CreateMap<UpdateClientRequestDto, Client>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.EncryptedPassword, opt => opt.Ignore());
        }
    }
}
