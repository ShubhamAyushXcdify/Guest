using AutoMapper;
using Core.Models;
using Application.DTOs;
using System.Text.Json;

namespace Application.Mappings
{
    public class CompanyProfile : Profile
    {
        public CompanyProfile()
        {
            // Company to CompanyDto mapping
            CreateMap<Company, CompanyDto>()
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src =>
                    string.IsNullOrEmpty(src.Address) ? null : DeserializeAddress(src.Address)));

            // CompanyDto to Company mapping
            CreateMap<CompanyDto, Company>()
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src =>
                    src.Address == null ? null : SerializeAddress(src.Address)));

            // CreateCompanyDto to Company mapping
            CreateMap<CreateCompanyDto, Company>()
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src =>
                    src.Address == null ? null : SerializeAddress(src.Address)));

            // UpdateCompanyDto to Company mapping
            CreateMap<UpdateCompanyDto, Company>()
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src =>
                    src.Address == null ? null : SerializeAddress(src.Address)))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }

        private static AddressDto? DeserializeAddress(string addressJson)
        {
            try
            {
                return JsonSerializer.Deserialize<AddressDto>(addressJson);
            }
            catch
            {
                return null;
            }
        }

        private static string SerializeAddress(AddressDto address)
        {
            try
            {
                return JsonSerializer.Serialize(address);
            }
            catch
            {
                return "{}";
            }
        }
    }
}
