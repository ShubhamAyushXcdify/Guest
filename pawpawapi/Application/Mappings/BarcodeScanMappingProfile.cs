using AutoMapper;
using Core.Models;

namespace Application.Mappings
{
    public class BarcodeScanMappingProfile : Profile
    {
        public BarcodeScanMappingProfile()
        {
            CreateMap<PurchaseOrderReceivingHistory, DTOs.BarcodeScanResponseDto>()
                .ForMember(dest => dest.ProductName, opt => opt.Ignore())
                .ForMember(dest => dest.ProductNumber, opt => opt.Ignore())
                .ForMember(dest => dest.GenericName, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                // ProductType removed
                .ForMember(dest => dest.ClinicName, opt => opt.Ignore())
                .ForMember(dest => dest.SupplierName, opt => opt.Ignore())
                .ForMember(dest => dest.ReceivedByName, opt => opt.Ignore())
                .ForMember(dest => dest.OrderNumber, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDate, opt => opt.Ignore())
                .ForMember(dest => dest.OrderStatus, opt => opt.Ignore())
                .ForMember(dest => dest.OrderTotalAmount, opt => opt.Ignore())
                .ForMember(dest => dest.QuantityOrdered, opt => opt.Ignore())
                .ForMember(dest => dest.RemainingQuantity, opt => opt.Ignore());
        }
    }
} 