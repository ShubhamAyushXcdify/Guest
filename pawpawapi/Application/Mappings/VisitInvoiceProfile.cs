using AutoMapper;
using Core.Models;
using Application.DTOs;

namespace Application.Mappings
{
    public class VisitInvoiceProfile : Profile
    {
        public VisitInvoiceProfile()
        {
            CreateMap<VisitInvoice, VisitInvoiceResponseDto>().ReverseMap();
            CreateMap<CreateVisitInvoiceRequestDto, VisitInvoice>()
                .ForMember(dest => dest.ClinicId, opt => opt.MapFrom(src => src.ClinicId));
            CreateMap<UpdateVisitInvoiceRequestDto, VisitInvoice>()
                .ForMember(dest => dest.ClinicId, opt => opt.Condition(src => src.ClinicId.HasValue))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<VisitInvoiceProductRequestDto, VisitInvoiceProduct>();
            CreateMap<Product, ProductDto>(); // Add mapping for Product to ProductDto
        }
    }
}
